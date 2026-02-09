import Requisition, { RequisitionRow } from '../models/Requisition';
import Site from '../models/Site';
import Facility from '../models/Facility';
import Schedule from '../models/Schedule';
import pool from '../config/database';
import { SiteRow, FacilityRow } from '../types/database';

interface SiteScore {
  site: SiteRow;
  totalScore: number;
  factors: {
    equipmentAvailability: number;
    radiologistAvailability: number;
    workload: number;
    priorityMatch: number;
  };
  reasoning: string;
}

interface RoutingResult {
  requisitionId: number;
  assignedSiteId: number;
  assignedSiteName: string;
  score: number;
  reasoning: string;
}

class RequisitionRouter {
  static async routeRequisitionToOptimalSite(requisitionId: number): Promise<RoutingResult> {
    const requisition = await Requisition.getById(requisitionId);
    if (!requisition) {
      throw new Error('Requisition not found');
    }

    const allSites = await Site.getAll();
    const candidateSites: SiteRow[] = [];

    // Filter sites that have the required equipment
    for (const site of allSites) {
      const facilities = await Facility.getBySite(site.id);
      const hasEquipment = facilities.some(
        (f: FacilityRow) => f.equipment_type === requisition.order_type && f.quantity > 0
      );

      if (hasEquipment) {
        candidateSites.push(site);
      }
    }

    if (candidateSites.length === 0) {
      throw new Error(`No sites available with ${requisition.order_type} equipment`);
    }

    // Score each candidate site
    const siteScores = await Promise.all(
      candidateSites.map(site => this.scoreSiteForRequisition(site, requisition))
    );

    // Sort by score (highest first)
    siteScores.sort((a, b) => b.totalScore - a.totalScore);
    const bestSite = siteScores[0];

    // Assign the requisition to the best site
    await Requisition.assignToSite(
      requisitionId,
      bestSite.site.id,
      bestSite.reasoning
    );

    return {
      requisitionId,
      assignedSiteId: bestSite.site.id,
      assignedSiteName: bestSite.site.name,
      score: bestSite.totalScore,
      reasoning: bestSite.reasoning
    };
  }

  static async scoreSiteForRequisition(site: SiteRow, requisition: RequisitionRow): Promise<SiteScore> {
    const factors: SiteScore['factors'] = {
      equipmentAvailability: 0,
      radiologistAvailability: 0,
      workload: 0,
      priorityMatch: 0
    };
    let totalScore = 0;

    // Equipment availability (0-30 points)
    const equipmentScore = await this.calculateEquipmentAvailability(site, requisition);
    factors.equipmentAvailability = equipmentScore;
    totalScore += equipmentScore;

    // Radiologist availability (0-25 points)
    const radiologistScore = await this.calculateRadiologistAvailability(site, requisition);
    factors.radiologistAvailability = radiologistScore;
    totalScore += radiologistScore;

    // Workload (0-20 points) - lower workload = higher score
    const workloadScore = await this.calculateWorkloadScore(site);
    factors.workload = workloadScore;
    totalScore += workloadScore;

    // Priority match (0-25 points) - time-sensitive and urgent get priority
    const priorityScore = await this.calculatePriorityMatch(site, requisition);
    factors.priorityMatch = priorityScore;
    totalScore += priorityScore;

    const reasoning = this.buildReasoning(factors, site, requisition);

    return {
      site,
      totalScore,
      factors,
      reasoning
    };
  }

  static async calculateEquipmentAvailability(site: SiteRow, requisition: RequisitionRow): Promise<number> {
    const facilities = await Facility.getBySite(site.id);
    const equipment = facilities.find((f: FacilityRow) => f.equipment_type === requisition.order_type);

    if (!equipment || equipment.quantity === 0) {
      return 0;
    }

    // Check capacity for next 7 days
    const today = new Date();
    let totalAvailability = 0;
    let daysChecked = 0;

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const capacity = await pool.query(
        `SELECT * FROM site_capacity 
         WHERE site_id = $1 
         AND equipment_type = $2 
         AND date = $3`,
        [site.id, requisition.order_type, dateStr]
      );

      if (capacity.rows.length > 0) {
        const cap = capacity.rows[0];
        const availabilityRatio = cap.available_slots / Math.max(cap.total_capacity, 1);
        totalAvailability += availabilityRatio;
      } else {
        // No capacity data means full availability
        totalAvailability += 1;
      }
      daysChecked++;
    }

    const avgAvailability = daysChecked > 0 ? totalAvailability / daysChecked : 0;
    return Math.round(avgAvailability * 30);
  }

  static async calculateRadiologistAvailability(site: SiteRow, _requisition: RequisitionRow): Promise<number> {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const schedules = await Schedule.getByDateRange(
      today.toISOString().split('T')[0],
      nextWeek.toISOString().split('T')[0],
      site.id
    );

    if (schedules.length === 0) {
      return 5; // Low score if no radiologists scheduled
    }

    const radiologistIds = [...new Set(schedules.map((s: any) => s.radiologist_id))] as number[];
    const availabilityScore = Math.min(25, radiologistIds.length * 5);
    return availabilityScore;
  }

  static async calculateWorkloadScore(site: SiteRow): Promise<number> {
    // Count pending orders at this site
    const pendingOrders = await pool.query(
      `SELECT COUNT(*) as count FROM orders 
       WHERE assigned_site_id = $1 
       AND status = 'pending'`,
      [site.id]
    );

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Count scheduled orders for next week
    const scheduledOrders = await pool.query(
      `SELECT COUNT(*) as count FROM orders 
       WHERE assigned_site_id = $1 
       AND status = 'scheduled' 
       AND scheduled_date BETWEEN $2 AND $3`,
      [site.id, today.toISOString().split('T')[0], nextWeek.toISOString().split('T')[0]]
    );

    const totalWorkload = parseInt(pendingOrders.rows[0].count) + parseInt(scheduledOrders.rows[0].count);
    // Normalize: 0 orders = 20 points, 50+ orders = 0 points
    const normalizedWorkload = Math.max(0, 1 - (totalWorkload / 50));
    return Math.round(normalizedWorkload * 20);
  }

  static async calculatePriorityMatch(site: SiteRow, requisition: RequisitionRow): Promise<number> {
    let score = 10; // Base score

    // Time-sensitive requisitions get priority
    if (requisition.is_time_sensitive) {
      score += 10;
      
      // Check if site can accommodate urgent requests
      const facilities = await Facility.getBySite(site.id);
      const equipment = facilities.find((f: FacilityRow) => f.equipment_type === requisition.order_type);
      if (equipment && equipment.quantity > 1) {
        score += 5; // Multiple machines = better for urgent
      }
    }

    // Priority-based scoring
    if (requisition.priority === 'stat') {
      score += 10;
    } else if (requisition.priority === 'urgent') {
      score += 5;
    }

    return Math.min(25, score);
  }

  static buildReasoning(factors: SiteScore['factors'], site: SiteRow, requisition: RequisitionRow): string {
    const reasons: string[] = [];
    
    if (factors.equipmentAvailability > 20) {
      reasons.push('excellent equipment availability');
    } else if (factors.equipmentAvailability > 10) {
      reasons.push('good equipment availability');
    }

    if (factors.radiologistAvailability > 15) {
      reasons.push('strong radiologist coverage');
    }

    if (factors.workload > 15) {
      reasons.push('low current workload');
    }

    if (factors.priorityMatch > 15) {
      reasons.push('well-suited for priority requirements');
    }

    if (requisition.is_time_sensitive) {
      reasons.push('can accommodate time-sensitive request');
    }

    return reasons.length > 0 
      ? `Selected ${site.name} based on: ${reasons.join(', ')}`
      : `Selected ${site.name} as the best available option`;
  }
}

export default RequisitionRouter;
