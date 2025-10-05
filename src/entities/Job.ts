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

export enum JobStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
  CANCELLED = 'cancelled',
}

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  EXECUTIVE = 'executive',
}

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column('text', { nullable: true })
  requirements?: string;

  @Column('text', { nullable: true })
  benefits?: string;

  @Column()
  department!: string;

  @Column()
  location!: string;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  status!: JobStatus;

  @Column({
    type: 'enum',
    enum: JobType,
    default: JobType.FULL_TIME,
  })
  type!: JobType;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  salaryMin?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  salaryMax?: number;

  @Column({ nullable: true })
  experienceLevel?: string;

  @Column('simple-array', { nullable: true })
  skills?: string[];

  @Column({ type: 'date', nullable: true })
  applicationDeadline?: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt?: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @Column()
  createdById!: string;

  @OneToMany('JobApplication', 'job')
  applications!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}