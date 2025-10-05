import { Router, Request, Response } from 'express';
import { JobApplicationService } from '../services/JobApplicationService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { ApplicationStatus } from '../entities/JobApplication';

const router = Router();
const applicationService = new JobApplicationService();

// Create a new application
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const applicantId = req.user!.id;
    const { jobId, coverLetter, resume, additionalDocuments } = req.body;

    const application = await applicationService.createApplication({
      jobId,
      applicantId,
      coverLetter,
      resume,
      additionalDocuments,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get all applications (with filters)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filters = {
      searchTerm: req.query.search as string,
      status: req.query.status as ApplicationStatus,
      jobId: req.query.jobId as string,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });

    const applications = await applicationService.searchApplications(filters);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get applications by current user (applicant)
router.get('/my-applications', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const applicantId = req.user!.id;
    const applications = await applicationService.getApplicationsByApplicant(applicantId);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get application statistics
router.get('/statistics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const jobId = req.query.jobId as string;
    const stats = await applicationService.getApplicationStatistics(jobId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get a specific application
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const application = await applicationService.getApplicationById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update application status
router.patch('/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    
    if (!Object.values(ApplicationStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await applicationService.updateApplicationStatus(req.params.id, status, notes);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(application);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Withdraw application
router.post('/:id/withdraw', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const application = await applicationService.getApplicationById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if the user is the applicant
    if (application.applicant.id !== req.user!.id) {
      return res.status(403).json({ error: 'You can only withdraw your own applications' });
    }

    const updatedApplication = await applicationService.withdrawApplication(req.params.id);
    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Bulk update applications
router.patch('/bulk-update', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { applicationIds, updates } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ error: 'Application IDs are required' });
    }

    if (updates.status && !Object.values(ApplicationStatus).includes(updates.status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await applicationService.bulkUpdateApplications(applicationIds, updates);
    res.json({ message: 'Applications updated successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;