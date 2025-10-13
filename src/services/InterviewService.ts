import { AppDataSource } from '../data-source';
import { Interview, InterviewStatus, InterviewType } from '../entities/Interview';
import { JobApplication } from '../entities/JobApplication';
import { User } from '../entities/User';
import { Repository } from 'typeorm';

export class InterviewService {
  private interviewRepository: Repository<Interview>;
  private applicationRepository: Repository<JobApplication>;
  private userRepository: Repository<User>;

  constructor() {
    this.interviewRepository = AppDataSource.getRepository(Interview);
    this.applicationRepository = AppDataSource.getRepository(JobApplication);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async scheduleInterview(data: {
    jobApplicationId: string;
    interviewerId: string;
    scheduledBy: string;
    scheduledAt: Date;
    title?: string;
    type?: InterviewType;
    location?: string;
    notes?: string;
  }): Promise<Interview> {
    // Verify the job application exists
    const application = await this.applicationRepository.findOne({
      where: { id: data.jobApplicationId },
      relations: ['applicant', 'job']
    });

    if (!application) {
      throw new Error('Job application not found');
    }

    // Verify the interviewer exists
    const interviewer = await this.userRepository.findOne({
      where: { id: data.interviewerId }
    });

    if (!interviewer) {
      throw new Error('Interviewer not found');
    }

    const interview = this.interviewRepository.create({
      jobApplicationId: data.jobApplicationId,
      interviewerId: data.interviewerId,
      scheduledById: data.scheduledBy,
      scheduledAt: data.scheduledAt,
      title: data.title || `Interview for ${application.job.title}`,
      type: data.type || InterviewType.VIDEO,
      location: data.location,
      notes: data.notes,
      status: InterviewStatus.SCHEDULED
    });

    return await this.interviewRepository.save(interview);
  }

  async getAllInterviews(): Promise<Interview[]> {
    return await this.interviewRepository.find({
      relations: ['jobApplication', 'jobApplication.applicant', 'jobApplication.job', 'interviewer'],
      order: { scheduledAt: 'ASC' }
    });
  }

  async getInterviewerInterviews(interviewerId: string): Promise<Interview[]> {
    return await this.interviewRepository.find({
      where: { interviewerId },
      relations: ['jobApplication', 'jobApplication.applicant', 'jobApplication.job'],
      order: { scheduledAt: 'ASC' }
    });
  }

  async getApplicantInterviews(applicantId: string): Promise<Interview[]> {
    return await this.interviewRepository.find({
      where: { 
        jobApplication: { applicantId } 
      },
      relations: ['jobApplication', 'jobApplication.job', 'interviewer'],
      order: { scheduledAt: 'ASC' }
    });
  }

  async getInterviewById(id: string): Promise<Interview | null> {
    return await this.interviewRepository.findOne({
      where: { id },
      relations: ['jobApplication', 'jobApplication.applicant', 'jobApplication.job', 'interviewer']
    });
  }

  async updateInterview(id: string, updateData: Partial<Interview>): Promise<Interview> {
    const interview = await this.getInterviewById(id);
    
    if (!interview) {
      throw new Error('Interview not found');
    }

    Object.assign(interview, updateData);
    return await this.interviewRepository.save(interview);
  }

  async cancelInterview(id: string, reason?: string): Promise<void> {
    const interview = await this.getInterviewById(id);
    
    if (!interview) {
      throw new Error('Interview not found');
    }

    interview.status = InterviewStatus.CANCELLED;
    interview.notes = reason ? `Cancelled: ${reason}` : 'Cancelled';
    
    await this.interviewRepository.save(interview);
  }

  async addFeedback(id: string, feedback: {
    rating?: number;
    notes?: string;
    recommendation?: string;
    interviewerId: string;
  }): Promise<Interview> {
    const interview = await this.getInterviewById(id);
    
    if (!interview) {
      throw new Error('Interview not found');
    }

    if (interview.interviewerId !== feedback.interviewerId) {
      throw new Error('Only the assigned interviewer can provide feedback');
    }

    // Set feedback as JSON object
    interview.feedback = {
      notes: feedback.notes || '',
      rating: feedback.rating || 0,
      recommendation: feedback.recommendation || ''
    };
    interview.score = feedback.rating;
    interview.status = InterviewStatus.COMPLETED;

    return await this.interviewRepository.save(interview);
  }

  async getUpcomingInterviews(): Promise<Interview[]> {
    return await this.interviewRepository.find({
      where: {
        scheduledAt: MoreThan(new Date()),
        status: InterviewStatus.SCHEDULED
      },
      relations: ['jobApplication', 'jobApplication.applicant', 'jobApplication.job', 'interviewer'],
      order: { scheduledAt: 'ASC' }
    });
  }

  async getUpcomingInterviewsForInterviewer(interviewerId: string): Promise<Interview[]> {
    return await this.interviewRepository.find({
      where: {
        interviewerId,
        scheduledAt: MoreThan(new Date()),
        status: InterviewStatus.SCHEDULED
      },
      relations: ['jobApplication', 'jobApplication.applicant', 'jobApplication.job'],
      order: { scheduledAt: 'ASC' }
    });
  }

  async getUpcomingInterviewsForApplicant(applicantId: string): Promise<Interview[]> {
    return await this.interviewRepository.find({
      where: {
        jobApplication: { applicantId },
        scheduledAt: MoreThan(new Date()),
        status: InterviewStatus.SCHEDULED
      },
      relations: ['jobApplication', 'jobApplication.job', 'interviewer'],
      order: { scheduledAt: 'ASC' }
    });
  }

  async getInterviewStats(): Promise<{
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    upcoming: number;
  }> {
    const [total, scheduled, completed, cancelled, upcoming] = await Promise.all([
      this.interviewRepository.count(),
      this.interviewRepository.count({ where: { status: InterviewStatus.SCHEDULED } }),
      this.interviewRepository.count({ where: { status: InterviewStatus.COMPLETED } }),
      this.interviewRepository.count({ where: { status: InterviewStatus.CANCELLED } }),
      this.interviewRepository.count({
        where: {
          scheduledAt: MoreThan(new Date()),
          status: InterviewStatus.SCHEDULED
        }
      })
    ]);

    return { total, scheduled, completed, cancelled, upcoming };
  }
}

// Import MoreThan from TypeORM
import { MoreThan } from 'typeorm';