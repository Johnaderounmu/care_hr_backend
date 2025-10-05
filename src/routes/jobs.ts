import { Router, Request, Response } from 'express';
import { JobService } from '../services/JobService';
import { JobApplicationService } from '../services/JobApplicationService';
import { authenticateToken } from '../middleware/auth';
import { JobStatus, JobType, ExperienceLevel } from '../entities/Job';
import { ApplicationStatus } from '../entities/JobApplication';

const router = Router();
const jobService = new JobService();
const applicationService = new JobApplicationService();

// Create a new job
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const job = await jobService.createJob(req.body, userId);
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get all jobs with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as JobStatus,
      type: req.query.type as JobType,
      department: req.query.department as string,
      location: req.query.location as string,
      experienceLevel: req.query.experienceLevel as ExperienceLevel,
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });

    const jobs = await jobService.getAllJobs(filters);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Search jobs
router.get('/search', async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.q as string;
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const jobs = await jobService.searchJobs(searchTerm);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get job statistics
router.get('/statistics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = await jobService.getJobStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get a specific job
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update a job
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const job = await jobService.updateJob(req.params.id, req.body);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Delete a job
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const deleted = await jobService.deleteJob(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Publish a job
router.post('/:id/publish', authenticateToken, async (req: Request, res: Response) => {
  try {
    const job = await jobService.publishJob(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Close a job
router.post('/:id/close', authenticateToken, async (req: Request, res: Response) => {
  try {
    const job = await jobService.closeJob(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get applications for a specific job
router.get('/:id/applications', authenticateToken, async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as ApplicationStatus,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    };

    const result = await applicationService.getApplicationsByJob(req.params.id, filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get application statistics for a specific job
router.get('/:id/applications/statistics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = await applicationService.getApplicationStatistics(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;