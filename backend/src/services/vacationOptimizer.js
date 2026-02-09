const Schedule = require('../models/Schedule');
const Radiologist = require('../models/Radiologist');
const Order = require('../models/Order');
const pool = require('../config/database');

class VacationOptimizer {
  static async optimizeVacations(startDate, endDate) {
    // Get all radiologists and their current schedules
    const radiologists = await Radiologist.getAll();
    const schedules = await Schedule.getByDateRange(startDate, endDate);
    
    // Calculate workload per site
    const siteWorkloads = {};
    const orders = await Order.getAll({ status: 'pending' });
    
    for (const order of orders) {
      const siteId = order.assigned_site_id || order.site_id;
      if (siteId) {
        if (!siteWorkloads[siteId]) {
          siteWorkloads[siteId] = 0;
        }
        siteWorkloads[siteId]++;
      }
    }
    
    // Calculate radiologist assignments per site
    const siteRadiologists = {};
    for (const schedule of schedules) {
      if (!siteRadiologists[schedule.site_id]) {
        siteRadiologists[schedule.site_id] = new Set();
      }
      siteRadiologists[schedule.site_id].add(schedule.radiologist_id);
    }
    
    // Calculate workload per radiologist per site
    const radiologistWorkloads = {};
    for (const [siteId, radiologistIds] of Object.entries(siteRadiologists)) {
      const workload = siteWorkloads[siteId] || 0;
      const radiologistCount = radiologistIds.size || 1;
      const avgWorkload = workload / radiologistCount;
      
      for (const radId of radiologistIds) {
        if (!radiologistWorkloads[radId]) {
          radiologistWorkloads[radId] = 0;
        }
        radiologistWorkloads[radId] += avgWorkload;
      }
    }
    
    // Find overworked and underworked sites
    const siteIds = Object.keys(siteWorkloads).map(id => parseInt(id));
    const avgWorkload = siteIds.length > 0 
      ? Object.values(siteWorkloads).reduce((a, b) => a + b, 0) / siteIds.length 
      : 0;
    
    const overworkedSites = [];
    const underworkedSites = [];
    
    for (const [siteId, workload] of Object.entries(siteWorkloads)) {
      if (workload > avgWorkload * 1.2) {
        overworkedSites.push({ siteId: parseInt(siteId), workload });
      } else if (workload < avgWorkload * 0.8) {
        underworkedSites.push({ siteId: parseInt(siteId), workload });
      }
    }
    
    // Generate recommendations
    const recommendations = [];
    
    for (const overworked of overworkedSites) {
      for (const underworked of underworkedSites) {
        // Find radiologists who can be reassigned
        const availableRadiologists = radiologists.filter(rad => {
          const radSites = schedules
            .filter(s => s.radiologist_id === rad.id && s.date >= startDate && s.date <= endDate)
            .map(s => s.site_id);
          return radSites.includes(underworked.siteId) || radSites.length === 0;
        });
        
        if (availableRadiologists.length > 0) {
          recommendations.push({
            action: 'reassign',
            fromSite: overworked.siteId,
            toSite: underworked.siteId,
            radiologist: availableRadiologists[0].id,
            radiologistName: availableRadiologists[0].name,
            reason: `Site ${overworked.siteId} is overworked (${overworked.workload} orders) while site ${underworked.siteId} is underworked (${underworked.workload} orders)`
          });
        }
      }
    }
    
    return {
      siteWorkloads,
      radiologistWorkloads,
      recommendations,
      overworkedSites,
      underworkedSites,
      averageWorkload: avgWorkload
    };
  }
}

module.exports = VacationOptimizer;

