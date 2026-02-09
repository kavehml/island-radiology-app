const Order = require('../models/Order');
const Site = require('../models/Site');
const Facility = require('../models/Facility');
const Schedule = require('../models/Schedule');
const Radiologist = require('../models/Radiologist');
const pool = require('../config/database');

class PatientRouter {
  /**
   * Route a patient order to the most optimized site
   * @param {number} orderId - The order ID to route
   * @returns {Object} Routing result with assigned site and reasoning
   */
  static async routeOrderToOptimalSite(orderId) {
    const order = await Order.getById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Get all sites that have the required equipment
    const allSites = await Site.getAll();
    const candidateSites = [];

    for (const site of allSites) {
      const facilities = await Facility.getBySite(site.id);
      const hasEquipment = facilities.some(
        f => f.equipment_type === order.order_type && f.quantity > 0
      );

      if (hasEquipment) {
        candidateSites.push(site);
      }
    }

    if (candidateSites.length === 0) {
      throw new Error(`No sites available with ${order.order_type} equipment`);
    }

    // Score each candidate site
    const siteScores = await Promise.all(
      candidateSites.map(site => this.scoreSiteForOrder(site, order))
    );

    // Sort by score (highest first)
    siteScores.sort((a, b) => b.totalScore - a.totalScore);

    const bestSite = siteScores[0];

    // Update order with assigned site
    await Order.updateAssignedSite(
      orderId,
      bestSite.site.id,
      bestSite.reasoning
    );

    // Log routing history
    await this.logRouting(orderId, order.site_id, bestSite.site.id, bestSite.reasoning, bestSite.totalScore);

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

  /**
   * Score a site for a given order
   */
  static async scoreSiteForOrder(site, order) {
    const factors = {};
    let totalScore = 0;

    // Factor 1: Equipment Availability (0-30 points)
    const equipmentScore = await this.calculateEquipmentAvailability(site, order);
    factors.equipmentAvailability = equipmentScore;
    totalScore += equipmentScore;

    // Factor 2: Radiologist Availability & Specialty Match (0-25 points)
    const radiologistScore = await this.calculateRadiologistAvailability(site, order);
    factors.radiologistAvailability = radiologistScore;
    totalScore += radiologistScore;

    // Factor 3: Current Workload (0-20 points) - Lower workload = higher score
    const workloadScore = await this.calculateWorkloadScore(site, order);
    factors.workload = workloadScore;
    totalScore += workloadScore;

    // Factor 4: Priority & Time Sensitivity Match (0-15 points)
    const priorityScore = await this.calculatePriorityMatch(site, order);
    factors.priorityMatch = priorityScore;
    totalScore += priorityScore;

    // Factor 5: Geographic/Logistic Considerations (0-10 points)
    const geographicScore = await this.calculateGeographicScore(site, order);
    factors.geographic = geographicScore;
    totalScore += geographicScore;

    // Build reasoning string
    const reasoning = this.buildReasoning(factors, site, order);

    return {
      site,
      totalScore,
      factors,
      reasoning
    };
  }

  /**
   * Calculate equipment availability score
   */
  static async calculateEquipmentAvailability(site, order) {
    const facilities = await Facility.getBySite(site.id);
    const equipment = facilities.find(f => f.equipment_type === order.order_type);

    if (!equipment || equipment.quantity === 0) {
      return 0;
    }

    // Check current bookings for today and next few days
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

    // Calculate average availability
    let totalAvailability = 0;
    let daysChecked = 0;

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const capacity = capacityData.rows.find(c => c.date === dateStr);
      if (capacity) {
        const availabilityRatio = capacity.available_slots / Math.max(capacity.total_capacity, 1);
        totalAvailability += availabilityRatio;
        daysChecked++;
      } else {
        // No capacity data means fully available
        totalAvailability += 1;
        daysChecked++;
      }
    }

    const avgAvailability = daysChecked > 0 ? totalAvailability / daysChecked : 0;
    return Math.round(avgAvailability * 30); // Scale to 0-30
  }

  /**
   * Calculate radiologist availability and specialty match
   */
  static async calculateRadiologistAvailability(site, order) {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Get radiologists scheduled at this site
    const schedules = await Schedule.getByDateRange(
      today.toISOString().split('T')[0],
      nextWeek.toISOString().split('T')[0],
      site.id
    );

    if (schedules.length === 0) {
      return 5; // Low score if no radiologists scheduled
    }

    // Get unique radiologists
    const radiologistIds = [...new Set(schedules.map(s => s.radiologist_id))];
    
    // Check specialty match
    let specialtyMatchScore = 0;
    if (order.specialty_required) {
      const specialtyMatches = await pool.query(
        `SELECT COUNT(*) as count FROM radiologist_specialties 
         WHERE radiologist_id = ANY($1::int[]) 
         AND specialty = $2`,
        [radiologistIds, order.specialty_required]
      );

      if (parseInt(specialtyMatches.rows[0].count) > 0) {
        specialtyMatchScore = 15; // High score for specialty match
      } else {
        specialtyMatchScore = 5; // Lower score, but still some radiologists available
      }
    } else {
      specialtyMatchScore = 10; // No specialty requirement, neutral score
    }

    // Calculate availability score based on number of radiologists
    const availabilityScore = Math.min(10, radiologistIds.length * 2);

    return specialtyMatchScore + availabilityScore;
  }

  /**
   * Calculate workload score (lower workload = higher score)
   */
  static async calculateWorkloadScore(site, order) {
    // Get pending orders for this site
    const pendingOrders = await Order.getAll({
      assignedSiteId: site.id,
      status: 'pending'
    });

    // Get scheduled orders for next 7 days
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

    // Normalize workload score (inverse relationship)
    // Assuming average site handles ~50 orders/week
    const normalizedWorkload = Math.max(0, 1 - (totalWorkload / 50));
    return Math.round(normalizedWorkload * 20); // Scale to 0-20
  }

  /**
   * Calculate priority match score
   */
  static async calculatePriorityMatch(site, order) {
    let score = 10; // Base score

    // If time sensitive, check if site can handle urgent cases
    if (order.is_time_sensitive) {
      // Check if site has capacity for urgent orders
      const urgentCapacity = await this.checkUrgentCapacity(site, order);
      if (urgentCapacity) {
        score += 5; // Bonus for handling urgent cases
      } else {
        score -= 5; // Penalty if can't handle urgent
      }
    }

    // High priority orders should go to sites with better resources
    if (order.priority_score >= 8) {
      const facilities = await Facility.getBySite(site.id);
      const equipment = facilities.find(f => f.equipment_type === order.order_type);
      if (equipment && equipment.quantity >= 2) {
        score += 3; // Bonus for multiple machines (redundancy)
      }
    }

    return Math.max(0, Math.min(15, score));
  }

  /**
   * Calculate geographic/logistic score
   */
  static async calculateGeographicScore(site, order) {
    // If order already has a preferred site (original site_id), give it preference
    if (order.site_id && order.site_id === site.id) {
      return 8; // Prefer original site
    }

    // Otherwise neutral score
    return 5;
  }

  /**
   * Check if site has capacity for urgent orders
   */
  static async checkUrgentCapacity(site, order) {
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

  /**
   * Build human-readable reasoning
   */
  static buildReasoning(factors, site, order) {
    const reasons = [];

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

    return `Selected ${site.name} because: ${reasons.join(', ')}. Overall score: ${factors.totalScore}/100`;
  }

  /**
   * Log routing decision
   */
  static async logRouting(orderId, originalSiteId, routedSiteId, reason, score) {
    await pool.query(
      `INSERT INTO order_routing_history 
       (order_id, original_site_id, routed_site_id, routing_reason, routing_score)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId, originalSiteId, routedSiteId, reason, score]
    );
  }

  /**
   * Auto-route all pending orders
   */
  static async autoRoutePendingOrders() {
    const pendingOrders = await Order.getAll({ status: 'pending' });
    const results = [];

    for (const order of pendingOrders) {
      try {
        if (!order.assigned_site_id) {
          const result = await this.routeOrderToOptimalSite(order.id);
          results.push(result);
        }
      } catch (error) {
        results.push({
          orderId: order.id,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Route time-sensitive orders with priority
   */
  static async routeTimeSensitiveOrders() {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 24); // Next 24 hours

    const timeSensitiveOrders = await Order.getTimeSensitiveOrders(deadline);
    const results = [];

    // Sort by deadline (earliest first)
    timeSensitiveOrders.sort((a, b) => 
      new Date(a.time_sensitive_deadline) - new Date(b.time_sensitive_deadline)
    );

    for (const order of timeSensitiveOrders) {
      try {
        const result = await this.routeOrderToOptimalSite(order.id);
        results.push(result);
      } catch (error) {
        results.push({
          orderId: order.id,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = PatientRouter;

