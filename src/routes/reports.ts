import { Router, Request, Response } from 'express';
import { ReportService } from '../services/ReportService';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const reportService = new ReportService();

// Get dashboard analytics
router.get('/analytics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (!['hr_admin', 'hr_manager', 'recruiter'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const analytics = await reportService.getDashboardAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get job application statistics
router.get('/applications-stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (!['hr_admin', 'hr_manager', 'recruiter'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const stats = await reportService.getApplicationStats(startDate, endDate);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get hiring pipeline data
router.get('/hiring-pipeline', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (!['hr_admin', 'hr_manager', 'recruiter'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const pipelineData = await reportService.getHiringPipelineData();
    res.json(pipelineData);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get document statistics
router.get('/documents-stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (!['hr_admin', 'hr_manager', 'recruiter'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const documentStats = await reportService.getDocumentStats();
    res.json(documentStats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get department-wise statistics
router.get('/departments-stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (!['hr_admin', 'hr_manager'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const departmentStats = await reportService.getDepartmentStats();
    res.json(departmentStats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Export data
router.get('/export/:type', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (!['hr_admin', 'hr_manager'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { type } = req.params;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const exportData = await reportService.exportData(type, startDate, endDate);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
    res.send(exportData);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;