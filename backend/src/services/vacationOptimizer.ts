import Schedule from '../models/Schedule';
import Radiologist from '../models/Radiologist';
import Order from '../models/Order';
import { RadiologistRow, OrderRow } from '../types/database';

interface OptimizationResult {
  siteWorkloads: Record<string, number>;
  radiologistWorkloads: Record<string, number>;
  recommendations: Array<{
    action: string;
    fromSite: number;
    toSite: number;
    radiologist: number;
    radiologistName: string;
    reason: string;
  }>;
  overworkedSites: Array<{ siteId: number; workload: number }>;
  underworkedSites: Array<{ siteId: number; workload: number }>;
  averageWorkload: number;
}

class VacationOptimizer {
  static async optimizeVacations(startDate: string, endDate: string): Promise<OptimizationResult> {
    const radiologists = await Radiologist.getAll();
    const schedules = await Schedule.getByDateRange(startDate, endDate);
    const orders = await Order.getAll({ status: 'pending' });
    
    const siteWorkloads: Record<string, number> = {};
    
    for (const order of orders) {
      const siteId = (order as OrderRow).assigned_site_id || (order as OrderRow).site_id;
      if (siteId) {
        if (!siteWorkloads[siteId]) {
          siteWorkloads[siteId] = 0;
        }
        siteWorkloads[siteId]++;
      }
    }
    
    const siteRadiologists: Record<string, Set<number>> = {};
    for (const schedule of schedules) {
      const siteId = (schedule as any).site_id;
      if (!siteRadiologists[siteId]) {
        siteRadiologists[siteId] = new Set();
      }
      siteRadiologists[siteId].add((schedule as any).radiologist_id);
    }
    
    const radiologistWorkloads: Record<string, number> = {};
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
    
    const siteIds = Object.keys(siteWorkloads).map(id => parseInt(id));
    const avgWorkload = siteIds.length > 0 
      ? Object.values(siteWorkloads).reduce((a, b) => a + b, 0) / siteIds.length 
      : 0;
    
    const overworkedSites: Array<{ siteId: number; workload: number }> = [];
    const underworkedSites: Array<{ siteId: number; workload: number }> = [];
    
    for (const [siteId, workload] of Object.entries(siteWorkloads)) {
      if (workload > avgWorkload * 1.2) {
        overworkedSites.push({ siteId: parseInt(siteId), workload });
      } else if (workload < avgWorkload * 0.8) {
        underworkedSites.push({ siteId: parseInt(siteId), workload });
      }
    }
    
    const recommendations: OptimizationResult['recommendations'] = [];
    
    for (const overworked of overworkedSites) {
      for (const underworked of underworkedSites) {
        const availableRadiologists = radiologists.filter((rad: RadiologistRow) => {
          const radSites = schedules
            .filter((s: any) => s.radiologist_id === rad.id && s.date >= startDate && s.date <= endDate)
            .map((s: any) => s.site_id);
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

export default VacationOptimizer;
