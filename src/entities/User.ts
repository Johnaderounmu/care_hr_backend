import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Job } from './Job';
import { JobApplication } from './JobApplication';
import { Document } from './Document';
import { Notification } from './Notification';
import { Interview } from './Interview';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  HR_ADMIN = 'hr_admin',
  HR_MANAGER = 'hr_manager',
  RECRUITER = 'recruiter',
  INTERVIEWER = 'interviewer',
  APPLICANT = 'applicant',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.APPLICANT,
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column('json', { nullable: true })
  preferences?: Record<string, any>;

  // Relationships
  @OneToMany(() => Job, (job) => job.createdBy)
  jobsCreated!: Job[];

  @OneToMany(() => JobApplication, (application) => application.applicant)
  applications!: JobApplication[];

  @OneToMany(() => Document, (document) => document.uploadedBy)
  documentsUploaded!: Document[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => Interview, (interview) => interview.interviewer)
  interviewsConducted!: Interview[];

  @OneToMany(() => Interview, (interview) => interview.scheduledBy)
  interviewsScheduled!: Interview[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
