import Order from '../models/Order';
import Site from '../models/Site';
import Facility from '../models/Facility';
import Schedule from '../models/Schedule';
import pool from '../config/database';
import { OrderRow, SiteRow, FacilityRow } from '../types/database';

interface SiteScore {
  site: SiteRow;
  totalScore: number;
  factors: {
    equipmentAvailability: number;
    radiologistAvailability: number;
    workload: number;
    priorityMatch: number;
    geographic: number;
  };
  reasoning: string;
}

interface RoutingResult {
  orderId: number;
  assignedSiteId: number;
  assignedSiteName: string;
  score: number;
  reasoning: string;
  allScores: Array<{
    siteId: number;
    siteName: string;
    score: number;
    factors: SiteScore['factors'];
  }>;
}

class PatientRouter {
  static async routeOrderToOptimalSite(orderId: number): Promise<RoutingResult> {
    const order = await Order.getById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const allSites = await Site.getAll();
    const candidateSites: SiteRow[] = [];

    for (const site of allSites) {
      const facilities = await Facility.getBySite(site.id);
      const hasEquipment = facilities.some(
        (f: FacilityRow) => f.equipment_type === order.order_type && f.quantity > 0
      );

      if (hasEquipment) {
        candidateSites.push(site);
      }
    }

    if (candidateSites.length === 0) {
      throw new Error(`No sites available with ${order.order_type} equipment`);
    }

    const siteScores = await Promise.all(
      candidateSites.map(site => this.scoreSiteForOrder(site, order))
    );

    siteScores.sort((a, b) => b.totalScore - a.totalScore);
    const bestSite = siteScores[0];

    await Order.updateAssignedSite(
      orderId,
      bestSite.site.id,
      bestSite.reasoning
    );

    await this.logRouting(orderId, order.site_id || null, bestSite.site.id, bestSite.reasoning, bestSite.totalScore);

    return {
      orderId,
      assignedSiteId: bestSite.site.id,
      assignedSiteName: bestSite.site.name,
      score: bestSite.totalScore,
      reasoning: bestSite.reasoning,
      allScores: siteScores.map(s => ({
        siteId: s.site.id,
        siteName: s.site.name,
        score: s.totalScore,
        factors: s.factors
      }))
    };
  }

  static async scoreSiteForOrder(site: SiteRow, order: OrderRow): Promise<SiteScore> {
    const factors: SiteScore['factors'] = {
      equipmentAvailability: 0,
      radiologistAvailability: 0,
      workload: 0,
      priorityMatch: 0,
      geographic: 0
    };
    let totalScore = 0;

    const equipmentScore = await this.calculateEquipmentAvailability(site, order);
    factors.equipmentAvailability = equipmentScore;
    totalScore += equipmentScore;

    const radiologistScore = await this.calculateRadiologistAvailability(site, order);
    factors.radiologistAvailability = radiologistScore;
    totalScore += radiologistScore;

    const workloadScore = await this.calculateWorkloadScore(site, order);
    factors.workload = workloadScore;
    totalScore += workloadScore;

    const priorityScore = await this.calculatePriorityMatch(site, order);
    factors.priorityMatch = priorityScore;
    totalScore += priorityScore;

    const geographicScore = await this.calculateGeographicScore(site, order);
    factors.geographic = geographicScore;
    totalScore += geographicScore;

    const reasoning = this.buildReasoning(factors, site, order);

    return {
      site,
      totalScore,
      factors,
      reasoning
    };
  }

  static async calculateEquipmentAvailability(site: SiteRow, order: OrderRow): Promise<number> {
    const facilities = await Facility.getBySite(site.id);
    const equipment = facilities.find((f: FacilityRow) => f.equipment_type === order.order_type);

    if (!equipment || equipment.quantity === 0) {
      return 0;
    }

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const capacityData = await pool.query(
      `SELECT * FROM site_capacity 
       WHERE site_id = $1 
       AND equipment_type = $2 
       AND date BETWEEN $3 AND $4
       ORDER BY date`,
      [site.id, order.order_type, today.toISOString().split('T')[0], nextWeek.toISOString().split('T')[0]]
    );

    let totalAvailability = 0;
    let daysChecked = 0;

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const capacity = capacityData.rows.find((c: any) => c.date === dateStr);
      if (capacity) {
        const availabilityRatio = capacity.available_slots / Math.max(capacity.total_capacity, 1);
        totalAvailability += availabilityRatio;
        daysChecked++;
      } else {
        totalAvailability += 1;
        daysChecked++;
      }
    }

    const avgAvailability = daysChecked > 0 ? totalAvailability / daysChecked : 0;
    return Math.round(avgAvailability * 30);
  }

  static async calculateRadiologistAvailability(site: SiteRow, order: OrderRow): Promise<number> {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const schedules = await Schedule.getByDateRange(
      today.toISOString().split('T')[0],
      nextWeek.toISOString().split('T')[0],
      site.id
    );

    if (schedules.length === 0) {
      return 5;
    }

    const radiologistIds = [...new Set(schedules.map((s: any) => s.radiologist_id))] as number[];
    
    let specialtyMatchScore = 0;
    if (order.specialty_required) {
      const specialtyMatches = await pool.query(
        `SELECT COUNT(*) as count FROM radiologist_specialties 
         WHERE radiologist_id = ANY($1::int[]) 
         AND specialty = $2`,
        [radiologistIds, order.specialty_required]
      );

      if (parseInt(specialtyMatches.rows[0].count) > 0) {
        specialtyMatchScore = 15;
      } else {
        specialtyMatchScore = 5;
      }
    } else {
      specialtyMatchScore = 10;
    }

    const availabilityScore = Math.min(10, radiologistIds.length * 2);
    return specialtyMatchScore + availabilityScore;
  }

  static async calculateWorkloadScore(site: SiteRow, _order: OrderRow): Promise<number> {
    const pendingOrders = await Order.getAll({
      assignedSiteId: site.id,
      status: 'pending'
    });

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const scheduledOrders = await pool.query(
      `SELECT COUNT(*) as count FROM orders 
       WHERE assigned_site_id = $1 
       AND status = 'scheduled' 
       AND scheduled_date BETWEEN $2 AND $3`,
      [site.id, today.toISOString().split('T')[0], nextWeek.toISOString().split('T')[0]]
    );

    const totalWorkload = pendingOrders.length + parseInt(scheduledOrders.rows[0].count);
    const normalizedWorkload = Math.max(0, 1 - (totalWorkload / 50));
    return Math.round(normalizedWorkload * 20);
  }

  static async calculatePriorityMatch(site: SiteRow, _order: OrderRow): Promise<number> {
    let score = 10;

    if (_order.is_time_sensitive) {
      const urgentCapacity = await this.checkUrgentCapacity(site, _order);
      if (urgentCapacity) {
        score += 5;
      } else {
        score -= 5;
      }
    }

    if (_order.priority_score >= 8) {
      const facilities = await Facility.getBySite(site.id);
      const equipment = facilities.find((f: FacilityRow) => f.equipment_type === _order.order_type);
      if (equipment && equipment.quantity >= 2) {
        score += 3;
      }
    }

    return Math.max(0, Math.min(15, score));
  }

  static async calculateGeographicScore(site: SiteRow, order: OrderRow): Promise<number> {
    if (order.site_id && order.site_id === site.id) {
      return 8;
    }
    return 5;
  }

  static async checkUrgentCapacity(site: SiteRow, order: OrderRow): Promise<boolean> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const capacity = await pool.query(
      `SELECT SUM(available_slots) as total_available 
       FROM site_capacity 
       WHERE site_id = $1 
       AND equipment_type = $2 
       AND date BETWEEN $3 AND $4`,
      [site.id, order.order_type, today.toISOString().split('T')[0], tomorrow.toISOString().split('T')[0]]
    );

    const available = parseInt(capacity.rows[0].total_available) || 0;
    return available > 0;
  }

  static buildReasoning(factors: SiteScore['factors'], site: SiteRow, order: OrderRow): string {
    const reasons: string[] = [];

    if (factors.equipmentAvailability >= 25) {
      reasons.push('excellent equipment availability');
    } else if (factors.equipmentAvailability >= 15) {
      reasons.push('good equipment availability');
    }

    if (factors.radiologistAvailability >= 20) {
      reasons.push('specialty-matched radiologists available');
    } else if (factors.radiologistAvailability >= 15) {
      reasons.push('radiologists available');
    }

    if (factors.workload >= 15) {
      reasons.push('low current workload');
    } else if (factors.workload <= 5) {
      reasons.push('higher workload (but still manageable)');
    }

    if (order.is_time_sensitive && factors.priorityMatch >= 12) {
      reasons.push('can accommodate time-sensitive order');
    }

    if (factors.geographic >= 7) {
      reasons.push('preferred location for patient');
    }

    return `Selected ${site.name} because: ${reasons.join(', ')}. Overall score: ${factors.equipmentAvailability + factors.radiologistAvailability + factors.workload + factors.priorityMatch + factors.geographic}/100`;
  }

  static async logRouting(orderId: number, originalSiteId: number | null, routedSiteId: number, reason: string, score: number): Promise<void> {
    await pool.query(
      `INSERT INTO order_routing_history 
       (order_id, original_site_id, routed_site_id, routing_reason, routing_score)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId, originalSiteId, routedSiteId, reason, score]
    );
  }

  static async autoRoutePendingOrders(): Promise<Array<RoutingResult | { orderId: number; error: string }>> {
    const pendingOrders = await Order.getAll({ status: 'pending' });
    const results: Array<RoutingResult | { orderId: number; error: string }> = [];

    for (const order of pendingOrders) {
      try {
        if (!(order as OrderRow).assigned_site_id) {
          const result = await this.routeOrderToOptimalSite((order as OrderRow).id);
          results.push(result);
        }
      } catch (error) {
        results.push({
          orderId: (order as OrderRow).id,
          error: (error as Error).message
        });
      }
    }

    return results;
  }

  static async routeTimeSensitiveOrders(): Promise<Array<RoutingResult | { orderId: number; error: string }>> {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 24);

    const timeSensitiveOrders = await Order.getTimeSensitiveOrders(deadline);
    const results: Array<RoutingResult | { orderId: number; error: string }> = [];

    timeSensitiveOrders.sort((a, b) => 
      new Date(a.time_sensitive_deadline!).getTime() - new Date(b.time_sensitive_deadline!).getTime()
    );

    for (const order of timeSensitiveOrders) {
      try {
        const result = await this.routeOrderToOptimalSite(order.id);
        results.push(result);
      } catch (error) {
        results.push({
          orderId: order.id,
          error: (error as Error).message
        });
      }
    }

    return results;
  }
}

export default PatientRouter;
