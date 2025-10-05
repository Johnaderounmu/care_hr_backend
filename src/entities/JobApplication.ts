import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  REVIEWED = 'reviewed',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  INTERVIEWING = 'interviewing',
  OFFERED = 'offered',
  ACCEPTED = 'accepted',
  HIRED = 'hired',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

@Entity()
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne('Job', 'applications', { nullable: false })
  @JoinColumn({ name: 'jobId' })
  job: any;

  @Column()
  jobId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'applicantId' })
  applicant!: User;

  @Column()
  applicantId!: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED,
  })
  status!: ApplicationStatus;

  @Column('text', { nullable: true })
  coverLetter?: string;

  @Column('json', { nullable: true })
  answers?: Record<string, any>;

  @Column({ nullable: true })
  resumeUrl?: string;

  @Column({ nullable: true })
  resume?: string;

  @Column('simple-array', { nullable: true })
  additionalDocuments?: string[];

  @Column({ type: 'timestamp', nullable: true })
  submittedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  withdrawnAt?: Date;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  score?: number;

  @Column('text', { nullable: true })
  notes?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewedById' })
  reviewedBy?: User;

  @Column({ nullable: true })
  reviewedById?: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @OneToMany('Document', 'jobApplication')
  documents!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}