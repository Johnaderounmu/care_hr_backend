import { Repository } from 'typeorm';
import { JobService } from '../../src/services/JobService';
import { Job, JobStatus, JobType, ExperienceLevel } from '../../src/entities/Job';
import { User, UserRole } from '../../src/entities/User';
import { AppDataSource } from '../../src/data-source';

// Mock the data source
jest.mock('../../src/data-source');

describe('JobService', () => {
  let jobService: JobService;
  let mockJobRepository: jest.Mocked<Repository<Job>>;
  let mockUserRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    fullName: 'Test User',
    role: UserRole.HR_ADMIN,
    status: 'active' as any,
    emailVerified: true,
    jobsCreated: [],
    applications: [],
    documentsUploaded: [],
    notifications: [],
    interviewsConducted: [],
    interviewsScheduled: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockJob: Job = {
    id: 'job-1',
    title: 'Software Engineer',
    description: 'A great job opportunity',
    department: 'Engineering',
    location: 'San Francisco',
    type: JobType.FULL_TIME,
    status: JobStatus.DRAFT,
    createdBy: mockUser,
    createdById: 'user-1',
    applications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Create mock repositories
    mockJobRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as any;

    mockUserRepository = {
      findOne: jest.fn(),
    } as any;

    // Mock AppDataSource.getRepository
    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Job) return mockJobRepository;
      if (entity === User) return mockUserRepository;
      return {};
    });

    jobService = new JobService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createJob', () => {
    it('should create a new job successfully', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJobRepository.create.mockReturnValue(mockJob);
      mockJobRepository.save.mockResolvedValue(mockJob);

      const jobData = {
        title: 'Software Engineer',
        description: 'A great job opportunity',
        department: 'Engineering',
        location: 'San Francisco',
        type: JobType.FULL_TIME,
      };

      // Act
      const result = await jobService.createJob(jobData, 'user-1');

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(mockJobRepository.create).toHaveBeenCalledWith({
        ...jobData,
        createdBy: mockUser,
        status: JobStatus.DRAFT,
      });
      expect(mockJobRepository.save).toHaveBeenCalledWith(mockJob);
      expect(result).toEqual(mockJob);
    });

    it('should throw error if creator user not found', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(jobService.createJob({}, 'non-existent-user')).rejects.toThrow('Creator user not found');
    });
  });

  describe('getJobById', () => {
    it('should return job with relations', async () => {
      // Arrange
      mockJobRepository.findOne.mockResolvedValue(mockJob);

      // Act
      const result = await jobService.getJobById('job-1');

      // Assert
      expect(mockJobRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        relations: ['createdBy', 'applications', 'applications.applicant'],
      });
      expect(result).toEqual(mockJob);
    });

    it('should return null if job not found', async () => {
      // Arrange
      mockJobRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await jobService.getJobById('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('publishJob', () => {
    it('should update job status to published and set publishedAt', async () => {
      // Arrange
      const publishedJob = { ...mockJob, status: JobStatus.PUBLISHED, publishedAt: new Date() };
      mockJobRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockJobRepository.findOne.mockResolvedValue(publishedJob);

      // Act
      const result = await jobService.publishJob('job-1');

      // Assert
      expect(mockJobRepository.update).toHaveBeenCalledWith('job-1', {
        status: JobStatus.PUBLISHED,
        publishedAt: expect.any(Date),
      });
      expect(result).toEqual(publishedJob);
    });
  });

  describe('searchJobs', () => {
    it('should search jobs with proper query builder', async () => {
      // Arrange
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockJob]),
      };
      mockJobRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await jobService.searchJobs('engineer');

      // Assert
      expect(mockJobRepository.createQueryBuilder).toHaveBeenCalledWith('job');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('job.createdBy', 'createdBy');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('job.title ILIKE :searchTerm', { searchTerm: '%engineer%' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('job.status = :status', { status: JobStatus.PUBLISHED });
      expect(result).toEqual([mockJob]);
    });
  });

  describe('getJobStatistics', () => {
    it('should return job statistics', async () => {
      // Arrange
      mockJobRepository.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(50)  // published
        .mockResolvedValueOnce(20)  // draft
        .mockResolvedValueOnce(25)  // closed
        .mockResolvedValueOnce(5);  // archived

      // Act
      const result = await jobService.getJobStatistics();

      // Assert
      expect(result).toEqual({
        total: 100,
        published: 50,
        draft: 20,
        closed: 25,
        archived: 5,
      });
    });
  });

  describe('deleteJob', () => {
    it('should delete job and return true if successful', async () => {
      // Arrange
      mockJobRepository.delete.mockResolvedValue({ affected: 1 } as any);

      // Act
      const result = await jobService.deleteJob('job-1');

      // Assert
      expect(mockJobRepository.delete).toHaveBeenCalledWith('job-1');
      expect(result).toBe(true);
    });

    it('should return false if no job was deleted', async () => {
      // Arrange
      mockJobRepository.delete.mockResolvedValue({ affected: 0 } as any);

      // Act
      const result = await jobService.deleteJob('non-existent');

      // Assert
      expect(result).toBe(false);
    });
  });
});