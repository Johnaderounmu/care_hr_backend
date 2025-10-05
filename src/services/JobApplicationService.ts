import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { JobApplication, ApplicationStatus } from '../entities/JobApplication';
import { Job } from '../entities/Job';
import { User } from '../entities/User';

export class JobApplicationService {
  private applicationRepository: Repository<JobApplication>;
  private jobRepository: Repository<Job>;
  private userRepository: Repository<User>;

  constructor() {
    this.applicationRepository = AppDataSource.getRepository(JobApplication);
    this.jobRepository = AppDataSource.getRepository(Job);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createApplication(applicationData: {
    jobId: string;
    applicantId: string;
    coverLetter?: string;
    resume?: string;
    additionalDocuments?: string[];
  }): Promise<JobApplication> {
    const job = await this.jobRepository.findOne({ where: { id: applicationData.jobId } });
    const applicant = await this.userRepository.findOne({ where: { id: applicationData.applicantId } });

    if (!job) {
      throw new Error('Job not found');
    }

    if (!applicant) {
      throw new Error('Applicant not found');
    }

    // Check if application already exists
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        job: { id: applicationData.jobId },
        applicant: { id: applicationData.applicantId },
      },
    });

    if (existingApplication) {
      throw new Error('Application already exists for this job and applicant');
    }

    const application = this.applicationRepository.create({
      job,
      applicant,
      coverLetter: applicationData.coverLetter,
      resume: applicationData.resume,
      additionalDocuments: applicationData.additionalDocuments,
      status: ApplicationStatus.SUBMITTED,
      submittedAt: new Date(),
    });

    return await this.applicationRepository.save(application);
  }

  async getApplicationById(id: string): Promise<JobApplication | null> {
    return await this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'applicant', 'documents', 'interviews'],
    });
  }

  async getApplicationsByJob(jobId: string, filters?: {
    status?: ApplicationStatus;
    limit?: number;
    offset?: number;
  }): Promise<{ applications: JobApplication[]; total: number }> {
    const queryBuilder = this.applicationRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.applicant', 'applicant')
      .leftJoinAndSelect('application.job', 'job')
      .where('application.jobId = :jobId', { jobId });

    if (filters?.status) {
      queryBuilder.andWhere('application.status = :status', { status: filters.status });
    }

    if (filters?.limit) {
      queryBuilder.take(filters.limit);
    }

    if (filters?.offset) {
      queryBuilder.skip(filters.offset);
    }

    const [applications, total] = await queryBuilder.getManyAndCount();
    return { applications, total };
  }

  async getApplicationsByApplicant(applicantId: string): Promise<JobApplication[]> {
    return await this.applicationRepository.find({
      where: { applicant: { id: applicantId } },
      relations: ['job', 'documents', 'interviews'],
      order: { submittedAt: 'DESC' },
    });
  }

  async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<JobApplication | null> {
    const updateData: any = { status };

    if (status === ApplicationStatus.REVIEWED) {
      updateData.reviewedAt = new Date();
    }

    if (notes) {
      updateData.notes = notes;
    }

    await this.applicationRepository.update(id, updateData);
    return await this.getApplicationById(id);
  }

  async withdrawApplication(id: string): Promise<JobApplication | null> {
    await this.applicationRepository.update(id, {
      status: ApplicationStatus.WITHDRAWN,
      withdrawnAt: new Date(),
    });
    return await this.getApplicationById(id);
  }

  async getApplicationStatistics(jobId?: string): Promise<{
    total: number;
    submitted: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
    hired: number;
    withdrawn: number;
  }> {
    const whereClause = jobId ? { job: { id: jobId } } : {};

    const [total, submitted, reviewed, shortlisted, rejected, hired, withdrawn] = await Promise.all([
      this.applicationRepository.count({ where: whereClause }),
      this.applicationRepository.count({ where: { ...whereClause, status: ApplicationStatus.SUBMITTED } }),
      this.applicationRepository.count({ where: { ...whereClause, status: ApplicationStatus.REVIEWED } }),
      this.applicationRepository.count({ where: { ...whereClause, status: ApplicationStatus.SHORTLISTED } }),
      this.applicationRepository.count({ where: { ...whereClause, status: ApplicationStatus.REJECTED } }),
      this.applicationRepository.count({ where: { ...whereClause, status: ApplicationStatus.HIRED } }),
      this.applicationRepository.count({ where: { ...whereClause, status: ApplicationStatus.WITHDRAWN } }),
    ]);

    return { total, submitted, reviewed, shortlisted, rejected, hired, withdrawn };
  }

  async bulkUpdateApplications(
    applicationIds: string[],
    updates: {
      status?: ApplicationStatus;
      notes?: string;
    }
  ): Promise<void> {
    await this.applicationRepository.update(applicationIds, updates);
  }

  async searchApplications(filters: {
    searchTerm?: string;
    status?: ApplicationStatus;
    jobId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<JobApplication[]> {
    const queryBuilder = this.applicationRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.applicant', 'applicant')
      .leftJoinAndSelect('application.job', 'job');

    if (filters.searchTerm) {
      queryBuilder.andWhere(
        '(applicant.fullName ILIKE :searchTerm OR applicant.email ILIKE :searchTerm OR job.title ILIKE :searchTerm)',
        { searchTerm: `%${filters.searchTerm}%` }
      );
    }

    if (filters.status) {
      queryBuilder.andWhere('application.status = :status', { status: filters.status });
    }

    if (filters.jobId) {
      queryBuilder.andWhere('application.jobId = :jobId', { jobId: filters.jobId });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('application.submittedAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('application.submittedAt <= :dateTo', { dateTo: filters.dateTo });
    }

    return await queryBuilder.getMany();
  }
}