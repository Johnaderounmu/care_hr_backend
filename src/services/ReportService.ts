import { AppDataSource } from '../data-source';
import { Job, JobStatus } from '../entities/Job';
import { JobApplication, ApplicationStatus } from '../entities/JobApplication';
import { Document, DocumentStatus } from '../entities/Document';
import { User } from '../entities/User';
import { Interview } from '../entities/Interview';
import { Repository } from 'typeorm';

export class ReportService {
  private jobRepository: Repository<Job>;
  private applicationRepository: Repository<JobApplication>;
  private documentRepository: Repository<Document>;
  private userRepository: Repository<User>;
  private interviewRepository: Repository<Interview>;

  constructor() {
    this.jobRepository = AppDataSource.getRepository(Job);
    this.applicationRepository = AppDataSource.getRepository(JobApplication);
    this.documentRepository = AppDataSource.getRepository(Document);
    this.userRepository = AppDataSource.getRepository(User);
    this.interviewRepository = AppDataSource.getRepository(Interview);
  }

  async getDashboardAnalytics(): Promise<{
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    pendingApplications: number;
    totalDocuments: number;
    pendingDocuments: number;
    totalInterviews: number;
    upcomingInterviews: number;
    monthlyApplications: { month: string; count: number }[];
    applicationsByStatus: { status: string; count: number }[];
  }> {
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      totalDocuments,
      pendingDocuments,
      totalInterviews,
      upcomingInterviews
    ] = await Promise.all([
      this.jobRepository.count(),
      this.jobRepository.count({ where: { status: JobStatus.ACTIVE } }),
      this.applicationRepository.count(),
      this.applicationRepository.count({ where: { status: ApplicationStatus.SUBMITTED } }),
      this.documentRepository.count(),
      this.documentRepository.count({ where: { status: DocumentStatus.PENDING } }),
      this.interviewRepository.count(),
      this.interviewRepository
        .createQueryBuilder('interview')
        .where('interview.scheduledAt > :now', { now: new Date() })
        .getCount()
    ]);

    // Get monthly applications data
    const monthlyApplications = await this.applicationRepository
      .createQueryBuilder('application')
      .select('DATE_FORMAT(application.createdAt, "%Y-%m") as month')
      .addSelect('COUNT(*) as count')
      .where('application.createdAt >= :sixMonthsAgo', { 
        sixMonthsAgo: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) 
      })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    // Get applications by status
    const applicationsByStatus = await this.applicationRepository
      .createQueryBuilder('application')
      .select('application.status as status')
      .addSelect('COUNT(*) as count')
      .groupBy('application.status')
      .getRawMany();

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      totalDocuments,
      pendingDocuments,
      totalInterviews,
      upcomingInterviews,
      monthlyApplications: monthlyApplications.map(item => ({
        month: item.month,
        count: parseInt(item.count)
      })),
      applicationsByStatus: applicationsByStatus.map(item => ({
        status: item.status,
        count: parseInt(item.count)
      }))
    };
  }

  async getApplicationStats(startDate?: string, endDate?: string): Promise<{
    totalApplications: number;
    newApplications: number;
    applicationsInReview: number;
    acceptedApplications: number;
    rejectedApplications: number;
    dailyApplications: { date: string; count: number }[];
  }> {
    const queryBuilder = this.applicationRepository.createQueryBuilder('application');
    
    if (startDate) {
      queryBuilder.andWhere('application.createdAt >= :startDate', { startDate: new Date(startDate) });
    }
    
    if (endDate) {
      queryBuilder.andWhere('application.createdAt <= :endDate', { endDate: new Date(endDate) });
    }

    const [
      totalApplications,
      newApplications,
      applicationsInReview,
      acceptedApplications,
      rejectedApplications
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('application.status = :status', { status: ApplicationStatus.SUBMITTED }).getCount(),
      queryBuilder.clone().andWhere('application.status = :status', { status: ApplicationStatus.UNDER_REVIEW }).getCount(),
      queryBuilder.clone().andWhere('application.status = :status', { status: ApplicationStatus.ACCEPTED }).getCount(),
      queryBuilder.clone().andWhere('application.status = :status', { status: ApplicationStatus.REJECTED }).getCount()
    ]);

    // Get daily applications
    const dailyApplications = await queryBuilder
      .select('DATE_FORMAT(application.createdAt, "%Y-%m-%d") as date')
      .addSelect('COUNT(*) as count')
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      totalApplications,
      newApplications,
      applicationsInReview,
      acceptedApplications,
      rejectedApplications,
      dailyApplications: dailyApplications.map(item => ({
        date: item.date,
        count: parseInt(item.count)
      }))
    };
  }

  async getHiringPipelineData(): Promise<{
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
  }> {
    const [applied, screening, interview, offer, hired] = await Promise.all([
      this.applicationRepository.count({ where: { status: ApplicationStatus.SUBMITTED } }),
      this.applicationRepository.count({ where: { status: ApplicationStatus.UNDER_REVIEW } }),
      this.applicationRepository.count({ where: { status: ApplicationStatus.INTERVIEWING } }),
      this.applicationRepository.count({ where: { status: ApplicationStatus.OFFERED } }),
      this.applicationRepository.count({ where: { status: ApplicationStatus.ACCEPTED } })
    ]);

    return { applied, screening, interview, offer, hired };
  }

  async getDocumentStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byType: { type: string; count: number }[];
  }> {
    const [total, pending, approved, rejected] = await Promise.all([
      this.documentRepository.count(),
      this.documentRepository.count({ where: { status: DocumentStatus.PENDING } }),
      this.documentRepository.count({ where: { status: DocumentStatus.APPROVED } }),
      this.documentRepository.count({ where: { status: DocumentStatus.REJECTED } })
    ]);

    const byType = await this.documentRepository
      .createQueryBuilder('document')
      .select('document.type as type')
      .addSelect('COUNT(*) as count')
      .groupBy('document.type')
      .getRawMany();

    return {
      total,
      pending,
      approved,
      rejected,
      byType: byType.map(item => ({
        type: item.type,
        count: parseInt(item.count)
      }))
    };
  }

  async getDepartmentStats(): Promise<{
    department: string;
    jobsCount: number;
    applicationsCount: number;
    avgTimeToHire: number;
  }[]> {
    const departmentStats = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.department as department')
      .addSelect('COUNT(DISTINCT job.id) as jobsCount')
      .addSelect('COUNT(DISTINCT applications.id) as applicationsCount')
      .leftJoin('job.applications', 'applications')
      .groupBy('job.department')
      .getRawMany();

    return departmentStats.map(stat => ({
      department: stat.department,
      jobsCount: parseInt(stat.jobsCount),
      applicationsCount: parseInt(stat.applicationsCount),
      avgTimeToHire: 0 // Would need more complex calculation
    }));
  }

  async exportData(type: string, startDate?: string, endDate?: string): Promise<string> {
    let data: any[] = [];
    let headers: string[] = [];

    switch (type) {
      case 'applications':
        const applications = await this.applicationRepository
          .createQueryBuilder('application')
          .leftJoinAndSelect('application.applicant', 'applicant')
          .leftJoinAndSelect('application.job', 'job')
          .where(startDate ? 'application.createdAt >= :startDate' : '1=1', { startDate: new Date(startDate || '') })
          .andWhere(endDate ? 'application.createdAt <= :endDate' : '1=1', { endDate: new Date(endDate || '') })
          .getMany();

        headers = ['ID', 'Applicant Email', 'Job Title', 'Status', 'Applied Date'];
        data = applications.map(app => [
          app.id,
          app.applicant?.email || '',
          app.job?.title || '',
          app.status,
          app.createdAt.toISOString().split('T')[0]
        ]);
        break;

      case 'jobs':
        const jobs = await this.jobRepository
          .createQueryBuilder('job')
          .leftJoinAndSelect('job.createdBy', 'createdBy')
          .getMany();

        headers = ['ID', 'Title', 'Department', 'Status', 'Created Date'];
        data = jobs.map(job => [
          job.id,
          job.title,
          job.department,
          job.status,
          job.createdAt.toISOString().split('T')[0]
        ]);
        break;

      default:
        throw new Error('Invalid export type');
    }

    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}