import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Job, JobStatus, JobType, ExperienceLevel } from '../entities/Job';
import { User } from '../entities/User';

export class JobService {
  private jobRepository: Repository<Job>;
  private userRepository: Repository<User>;

  constructor() {
    this.jobRepository = AppDataSource.getRepository(Job);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createJob(jobData: Partial<Job>, createdById: string): Promise<Job> {
    const createdBy = await this.userRepository.findOne({ where: { id: createdById } });
    if (!createdBy) {
      throw new Error('Creator user not found');
    }

    const job = this.jobRepository.create({
      ...jobData,
      createdBy,
      status: JobStatus.DRAFT,
    });

    return await this.jobRepository.save(job);
  }

  async getAllJobs(filters?: {
    status?: JobStatus;
    type?: JobType;
    department?: string;
    location?: string;
    experienceLevel?: ExperienceLevel;
  }): Promise<Job[]> {
    const queryBuilder = this.jobRepository.createQueryBuilder('job')
      .leftJoinAndSelect('job.createdBy', 'createdBy')
      .leftJoinAndSelect('job.applications', 'applications');

    if (filters?.status) {
      queryBuilder.andWhere('job.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      queryBuilder.andWhere('job.type = :type', { type: filters.type });
    }

    if (filters?.department) {
      queryBuilder.andWhere('job.department = :department', { department: filters.department });
    }

    if (filters?.location) {
      queryBuilder.andWhere('job.location ILIKE :location', { location: `%${filters.location}%` });
    }

    if (filters?.experienceLevel) {
      queryBuilder.andWhere('job.experienceLevel = :experienceLevel', { experienceLevel: filters.experienceLevel });
    }

    return await queryBuilder.getMany();
  }

  async getJobById(id: string): Promise<Job | null> {
    return await this.jobRepository.findOne({
      where: { id },
      relations: ['createdBy', 'applications', 'applications.applicant'],
    });
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    await this.jobRepository.update(id, updates);
    return await this.getJobById(id);
  }

  async deleteJob(id: string): Promise<boolean> {
    const result = await this.jobRepository.delete(id);
    return result.affected !== 0;
  }

  async publishJob(id: string): Promise<Job | null> {
    await this.jobRepository.update(id, { 
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
    });
    return await this.getJobById(id);
  }

  async closeJob(id: string): Promise<Job | null> {
    await this.jobRepository.update(id, { 
      status: JobStatus.CLOSED,
      closedAt: new Date(),
    });
    return await this.getJobById(id);
  }

  async getJobStatistics(): Promise<{
    total: number;
    published: number;
    draft: number;
    closed: number;
    archived: number;
  }> {
    const [total, published, draft, closed, archived] = await Promise.all([
      this.jobRepository.count(),
      this.jobRepository.count({ where: { status: JobStatus.PUBLISHED } }),
      this.jobRepository.count({ where: { status: JobStatus.DRAFT } }),
      this.jobRepository.count({ where: { status: JobStatus.CLOSED } }),
      this.jobRepository.count({ where: { status: JobStatus.ARCHIVED } }),
    ]);

    return { total, published, draft, closed, archived };
  }

  async searchJobs(searchTerm: string): Promise<Job[]> {
    return await this.jobRepository.createQueryBuilder('job')
      .leftJoinAndSelect('job.createdBy', 'createdBy')
      .where('job.title ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('job.description ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('job.department ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('job.location ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .andWhere('job.status = :status', { status: JobStatus.PUBLISHED })
      .getMany();
  }
}