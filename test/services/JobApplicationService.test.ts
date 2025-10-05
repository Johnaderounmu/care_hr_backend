import { Repository } from 'typeorm';
import { JobApplicationService } from '../../src/services/JobApplicationService';
import { JobApplication, ApplicationStatus } from '../../src/entities/JobApplication';
import { Job, JobStatus, JobType } from '../../src/entities/Job';
import { User, UserRole } from '../../src/entities/User';
import { AppDataSource } from '../../src/data-source';

// Mock the data source
jest.mock('../../src/data-source');

describe('JobApplicationService', () => {
  let applicationService: JobApplicationService;
  let mockApplicationRepository: jest.Mocked<Repository<JobApplication>>;
  let mockJobRepository: jest.Mocked<Repository<Job>>;
  let mockUserRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'user-1',
    email: 'applicant@example.com',
    fullName: 'John Applicant',
    role: UserRole.APPLICANT,
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
    status: JobStatus.PUBLISHED,
    createdBy: mockUser,
    createdById: 'hr-user-1',
    applications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockApplication: JobApplication = {
    id: 'app-1',
    job: mockJob,
    jobId: 'job-1',
    applicant: mockUser,
    applicantId: 'user-1',
    status: ApplicationStatus.SUBMITTED,
    submittedAt: new Date(),
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Create mock repositories
    mockApplicationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    } as any;

    mockJobRepository = {
      findOne: jest.fn(),
    } as any;

    mockUserRepository = {
      findOne: jest.fn(),
    } as any;

    // Mock AppDataSource.getRepository
    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === JobApplication) return mockApplicationRepository;
      if (entity === Job) return mockJobRepository;
      if (entity === User) return mockUserRepository;
      return {};
    });

    applicationService = new JobApplicationService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createApplication', () => {
    it('should create a new application successfully', async () => {
      // Arrange
      mockJobRepository.findOne.mockResolvedValue(mockJob);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockApplicationRepository.findOne.mockResolvedValue(null); // No existing application
      mockApplicationRepository.create.mockReturnValue(mockApplication);
      mockApplicationRepository.save.mockResolvedValue(mockApplication);

      const applicationData = {
        jobId: 'job-1',
        applicantId: 'user-1',
        coverLetter: 'I am very interested in this position',
        resume: 'resume-url',
      };

      // Act
      const result = await applicationService.createApplication(applicationData);

      // Assert
      expect(mockJobRepository.findOne).toHaveBeenCalledWith({ where: { id: 'job-1' } });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(mockApplicationRepository.findOne).toHaveBeenCalledWith({
        where: {
          job: { id: 'job-1' },
          applicant: { id: 'user-1' },
        },
      });
      expect(mockApplicationRepository.create).toHaveBeenCalledWith({
        job: mockJob,
        applicant: mockUser,
        coverLetter: 'I am very interested in this position',
        resume: 'resume-url',
        additionalDocuments: undefined,
        status: ApplicationStatus.SUBMITTED,
        submittedAt: expect.any(Date),
      });
      expect(result).toEqual(mockApplication);
    });

    it('should throw error if job not found', async () => {
      // Arrange
      mockJobRepository.findOne.mockResolvedValue(null);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const applicationData = {
        jobId: 'non-existent-job',
        applicantId: 'user-1',
      };

      // Act & Assert
      await expect(applicationService.createApplication(applicationData)).rejects.toThrow('Job not found');
    });

    it('should throw error if applicant not found', async () => {
      // Arrange
      mockJobRepository.findOne.mockResolvedValue(mockJob);
      mockUserRepository.findOne.mockResolvedValue(null);

      const applicationData = {
        jobId: 'job-1',
        applicantId: 'non-existent-user',
      };

      // Act & Assert
      await expect(applicationService.createApplication(applicationData)).rejects.toThrow('Applicant not found');
    });

    it('should throw error if application already exists', async () => {
      // Arrange
      mockJobRepository.findOne.mockResolvedValue(mockJob);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockApplicationRepository.findOne.mockResolvedValue(mockApplication); // Existing application

      const applicationData = {
        jobId: 'job-1',
        applicantId: 'user-1',
      };

      // Act & Assert
      await expect(applicationService.createApplication(applicationData)).rejects.toThrow(
        'Application already exists for this job and applicant'
      );
    });
  });

  describe('getApplicationById', () => {
    it('should return application with relations', async () => {
      // Arrange
      mockApplicationRepository.findOne.mockResolvedValue(mockApplication);

      // Act
      const result = await applicationService.getApplicationById('app-1');

      // Assert
      expect(mockApplicationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'app-1' },
        relations: ['job', 'applicant', 'documents', 'interviews'],
      });
      expect(result).toEqual(mockApplication);
    });

    it('should return null if application not found', async () => {
      // Arrange
      mockApplicationRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await applicationService.getApplicationById('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update application status', async () => {
      // Arrange
      const updatedApplication = { ...mockApplication, status: ApplicationStatus.REVIEWED };
      mockApplicationRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockApplicationRepository.findOne.mockResolvedValue(updatedApplication);

      // Act
      const result = await applicationService.updateApplicationStatus('app-1', ApplicationStatus.REVIEWED, 'Great candidate');

      // Assert
      expect(mockApplicationRepository.update).toHaveBeenCalledWith('app-1', {
        status: ApplicationStatus.REVIEWED,
        reviewedAt: expect.any(Date),
        notes: 'Great candidate',
      });
      expect(result).toEqual(updatedApplication);
    });
  });

  describe('withdrawApplication', () => {
    it('should withdraw application', async () => {
      // Arrange
      const withdrawnApplication = { ...mockApplication, status: ApplicationStatus.WITHDRAWN };
      mockApplicationRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockApplicationRepository.findOne.mockResolvedValue(withdrawnApplication);

      // Act
      const result = await applicationService.withdrawApplication('app-1');

      // Assert
      expect(mockApplicationRepository.update).toHaveBeenCalledWith('app-1', {
        status: ApplicationStatus.WITHDRAWN,
        withdrawnAt: expect.any(Date),
      });
      expect(result).toEqual(withdrawnApplication);
    });
  });

  describe('getApplicationStatistics', () => {
    it('should return application statistics', async () => {
      // Arrange
      mockApplicationRepository.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(60)  // submitted
        .mockResolvedValueOnce(20)  // reviewed
        .mockResolvedValueOnce(10)  // shortlisted
        .mockResolvedValueOnce(5)   // rejected
        .mockResolvedValueOnce(3)   // hired
        .mockResolvedValueOnce(2);  // withdrawn

      // Act
      const result = await applicationService.getApplicationStatistics();

      // Assert
      expect(result).toEqual({
        total: 100,
        submitted: 60,
        reviewed: 20,
        shortlisted: 10,
        rejected: 5,
        hired: 3,
        withdrawn: 2,
      });
    });

    it('should return statistics for a specific job', async () => {
      // Arrange
      mockApplicationRepository.count.mockResolvedValue(25);

      // Act
      const result = await applicationService.getApplicationStatistics('job-1');

      // Assert
      expect(mockApplicationRepository.count).toHaveBeenCalledWith({
        where: { job: { id: 'job-1' } },
      });
    });
  });

  describe('getApplicationsByApplicant', () => {
    it('should return applications for an applicant', async () => {
      // Arrange
      mockApplicationRepository.find.mockResolvedValue([mockApplication]);

      // Act
      const result = await applicationService.getApplicationsByApplicant('user-1');

      // Assert
      expect(mockApplicationRepository.find).toHaveBeenCalledWith({
        where: { applicant: { id: 'user-1' } },
        relations: ['job', 'documents', 'interviews'],
        order: { submittedAt: 'DESC' },
      });
      expect(result).toEqual([mockApplication]);
    });
  });
});