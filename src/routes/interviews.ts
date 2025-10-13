import { Router, Request, Response } from 'express';
import { InterviewService } from '../services/InterviewService';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const interviewService = new InterviewService();

// Schedule an interview
router.post('/schedule', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (!['hr_admin', 'hr_manager', 'recruiter', 'interviewer'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const scheduledBy = (req as any).user.id;
    const { jobApplicationId, interviewerId, scheduledAt, type, location, notes } = req.body;
    
    const interview = await interviewService.scheduleInterview({
      jobApplicationId,
      interviewerId,
      scheduledBy,
      scheduledAt: new Date(scheduledAt),
      type,
      location,
      notes
    });
    
    res.status(201).json(interview);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get interviews for a user
router.get('/my-interviews', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    let interviews;
    if (['hr_admin', 'hr_manager', 'recruiter'].includes(userRole)) {
      // HR users can see all interviews
      interviews = await interviewService.getAllInterviews();
    } else if (userRole === 'interviewer') {
      // Interviewers can see interviews they're conducting
      interviews = await interviewService.getInterviewerInterviews(userId);
    } else {
      // Applicants can see their own interviews
      interviews = await interviewService.getApplicantInterviews(userId);
    }
    
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get interview by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    const interview = await interviewService.getInterviewById(id);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    // Check if user can access this interview
    const canAccess = 
      ['hr_admin', 'hr_manager', 'recruiter'].includes(userRole) ||
      interview.interviewerId === userId ||
      interview.jobApplication?.applicantId === userId;
    
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update interview
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (!['hr_admin', 'hr_manager', 'recruiter'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { id } = req.params;
    const updateData = req.body;
    
    const interview = await interviewService.updateInterview(id, updateData);
    res.json(interview);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Cancel interview
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (!['hr_admin', 'hr_manager', 'recruiter'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { id } = req.params;
    const { reason } = req.body;
    
    await interviewService.cancelInterview(id, reason);
    res.json({ message: 'Interview cancelled successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Add interview feedback
router.post('/:id/feedback', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { rating, notes, recommendation } = req.body;
    
    const interview = await interviewService.addFeedback(id, {
      rating,
      notes,
      recommendation,
      interviewerId: userId
    });
    
    res.json(interview);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get upcoming interviews
router.get('/upcoming/list', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    const userId = (req as any).user.id;
    
    let interviews;
    if (['hr_admin', 'hr_manager', 'recruiter'].includes(userRole)) {
      interviews = await interviewService.getUpcomingInterviews();
    } else if (userRole === 'interviewer') {
      interviews = await interviewService.getUpcomingInterviewsForInterviewer(userId);
    } else {
      interviews = await interviewService.getUpcomingInterviewsForApplicant(userId);
    }
    
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;