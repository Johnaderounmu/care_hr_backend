# Care HR Database Schema Documentation

## Overview

The Care HR system uses PostgreSQL with TypeORM for data persistence. The database schema is designed to support a comprehensive HR management system with job postings, applications, document management, notifications, and interview scheduling.

## Entity Relationships

```
User (1) ──── (*) Job (Created Jobs)
User (1) ──── (*) JobApplication (Applications)
User (1) ──── (*) Document (Uploaded Documents)
User (1) ──── (*) Notification (User Notifications)
User (1) ──── (*) Interview (Conducted Interviews)
User (1) ──── (*) Interview (Scheduled Interviews)

Job (1) ──── (*) JobApplication
JobApplication (1) ──── (*) Document
JobApplication (1) ──── (*) Interview

User ──── Interview (Many-to-Many via UserInterview)
```

## Entities

### User
**Purpose**: Central entity for all system users (HR staff, applicants, etc.)

**Key Fields**:
- `id` (UUID): Primary key
- `email` (string): Unique email address
- `role` (enum): UserRole (SUPER_ADMIN, HR_ADMIN, HR_MANAGER, RECRUITER, INTERVIEWER, APPLICANT)
- `status` (enum): UserStatus (ACTIVE, INACTIVE, SUSPENDED, PENDING)
- `fullName`, `firstName`, `lastName` (string): User identity
- `emailVerified` (boolean): Email verification status
- `lastLoginAt` (timestamp): Last login tracking
- `preferences` (JSON): User-specific settings

**Relationships**:
- One-to-many with Job (jobs created)
- One-to-many with JobApplication (applications submitted)
- One-to-many with Document (documents uploaded)
- One-to-many with Notification (notifications received)
- One-to-many with Interview (interviews conducted/scheduled)

### Job
**Purpose**: Job postings and position management

**Key Fields**:
- `id` (UUID): Primary key
- `title` (string): Job title
- `description` (text): Detailed job description
- `department`, `location` (string): Job categorization
- `type` (enum): JobType (FULL_TIME, PART_TIME, CONTRACT, TEMPORARY, INTERNSHIP)
- `experienceLevel` (enum): ExperienceLevel (ENTRY, JUNIOR, MID, SENIOR, LEAD, EXECUTIVE)
- `status` (enum): JobStatus (DRAFT, PUBLISHED, ACTIVE, CLOSED, ARCHIVED, CANCELLED)
- `salaryMin`, `salaryMax` (decimal): Compensation range
- `skills`, `benefits` (array): Job attributes
- `publishedAt`, `closedAt`, `applicationDeadline` (timestamp): Lifecycle dates

**Relationships**:
- Many-to-one with User (creator)
- One-to-many with JobApplication

### JobApplication
**Purpose**: Application submissions and tracking

**Key Fields**:
- `id` (UUID): Primary key
- `status` (enum): ApplicationStatus (SUBMITTED, REVIEWED, UNDER_REVIEW, SHORTLISTED, INTERVIEWING, OFFERED, ACCEPTED, HIRED, REJECTED, WITHDRAWN)
- `coverLetter` (text): Applicant's cover letter
- `resume`, `resumeUrl` (string): Resume information
- `answers` (JSON): Application form responses
- `score` (decimal): Evaluation score
- `notes` (text): HR notes
- `submittedAt`, `reviewedAt`, `withdrawnAt` (timestamp): Process timestamps

**Relationships**:
- Many-to-one with Job
- Many-to-one with User (applicant)
- Many-to-one with User (reviewer)
- One-to-many with Document
- One-to-many with Interview

### Document
**Purpose**: File and document management

**Key Fields**:
- `id` (UUID): Primary key
- `filename`, `originalName` (string): File identification
- `mimeType` (string): File type
- `size` (integer): File size in bytes
- `url`, `s3Key` (string): Storage location
- `type` (enum): DocumentType (RESUME, COVER_LETTER, PORTFOLIO, CERTIFICATE, ID_DOCUMENT, OTHER)
- `status` (enum): DocumentStatus (UPLOADED, PROCESSING, PROCESSED, APPROVED, REJECTED)
- `isPublic` (boolean): Access control
- `metadata` (JSON): Additional file information

**Relationships**:
- Many-to-one with User (uploader)
- Many-to-one with JobApplication (optional)

### Notification
**Purpose**: System notifications and messaging

**Key Fields**:
- `id` (UUID): Primary key
- `title`, `message` (string): Notification content
- `type` (enum): NotificationType (APPLICATION_RECEIVED, STATUS_UPDATE, INTERVIEW_SCHEDULED, DEADLINE_REMINDER, SYSTEM_ALERT)
- `priority` (enum): NotificationPriority (LOW, MEDIUM, HIGH, URGENT)
- `isRead` (boolean): Read status
- `readAt` (timestamp): Read timestamp
- `data` (JSON): Additional notification data

**Relationships**:
- Many-to-one with User (recipient)

### Interview
**Purpose**: Interview scheduling and management

**Key Fields**:
- `id` (UUID): Primary key
- `type` (enum): InterviewType (PHONE, VIDEO, IN_PERSON, TECHNICAL, BEHAVIORAL)
- `status` (enum): InterviewStatus (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)
- `scheduledAt` (timestamp): Interview date/time
- `duration` (integer): Interview duration in minutes
- `location`, `meetingLink` (string): Interview venue
- `notes`, `feedback` (text): Interview documentation
- `score` (decimal): Interview evaluation

**Relationships**:
- Many-to-one with JobApplication
- Many-to-one with User (interviewer)
- Many-to-one with User (scheduled by)

## Enums

### UserRole
- `SUPER_ADMIN`: System administrator
- `HR_ADMIN`: HR department administrator
- `HR_MANAGER`: HR management role
- `RECRUITER`: Recruitment specialist
- `INTERVIEWER`: Interview conductor
- `APPLICANT`: Job applicant

### JobStatus
- `DRAFT`: Job being prepared
- `PUBLISHED`: Job published and accepting applications
- `ACTIVE`: Currently active job
- `CLOSED`: Job closed to new applications
- `ARCHIVED`: Job archived
- `CANCELLED`: Job cancelled

### ApplicationStatus
- `SUBMITTED`: Initial application submission
- `REVIEWED`: Application has been reviewed
- `UNDER_REVIEW`: Currently under evaluation
- `SHORTLISTED`: Selected for further consideration
- `INTERVIEWING`: In interview process
- `OFFERED`: Job offer extended
- `ACCEPTED`: Offer accepted
- `HIRED`: Candidate hired
- `REJECTED`: Application rejected
- `WITHDRAWN`: Application withdrawn by applicant

### DocumentStatus
- `UPLOADED`: File uploaded successfully
- `PROCESSING`: File being processed
- `PROCESSED`: Processing completed
- `APPROVED`: Document approved
- `REJECTED`: Document rejected

### NotificationPriority
- `LOW`: Low priority notification
- `MEDIUM`: Medium priority notification
- `HIGH`: High priority notification
- `URGENT`: Urgent notification requiring immediate attention

## Indexes and Performance

The schema includes several indexes for optimal query performance:

- User email (unique index)
- Job status and department (compound index)
- JobApplication status and job_id (compound index)
- Document type and user_id (compound index)
- Notification user_id and is_read (compound index)
- Interview scheduled_at and status (compound index)

## Data Integrity

The schema enforces data integrity through:

- Foreign key constraints for all relationships
- Enum constraints for status and type fields
- NOT NULL constraints for essential fields
- Unique constraints where appropriate
- Check constraints for business rules (e.g., salary ranges)

## Migration Strategy

The schema uses TypeORM's synchronization feature for development, with plans to implement proper migrations for production deployments. The `synchronize: true` setting automatically updates the database schema based on entity definitions.

## Backup and Recovery

Database backups should be performed regularly using PostgreSQL's native tools:
- `pg_dump` for full database backups
- Point-in-time recovery (PITR) for production systems
- Regular testing of backup restoration procedures

## Security Considerations

- Sensitive data (passwords, tokens) are properly hashed/encrypted
- Row-level security can be implemented for multi-tenant scenarios
- Audit trails are maintained through timestamp fields
- Document access is controlled through the `isPublic` flag and user relationships