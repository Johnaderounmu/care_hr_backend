import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { JobApplication } from './JobApplication';

export enum InterviewType {
  PHONE = 'phone',
  VIDEO = 'video',
  IN_PERSON = 'in_person',
  PANEL = 'panel',
  TECHNICAL = 'technical',
}

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
  NO_SHOW = 'no_show',
}

@Entity()
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => JobApplication, { nullable: false })
  @JoinColumn({ name: 'jobApplicationId' })
  jobApplication!: JobApplication;

  @Column()
  jobApplicationId!: string;

  @Column()
  title!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: InterviewType,
    default: InterviewType.VIDEO,
  })
  type!: InterviewType;

  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED,
  })
  status!: InterviewStatus;

  @Column({ type: 'timestamp' })
  scheduledAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime?: Date;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  meetingLink?: string;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  score?: number;

  @Column('json', { nullable: true })
  feedback?: Record<string, string | number | boolean>;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'interviewerId' })
  interviewer!: User;

  @Column()
  interviewerId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'scheduledById' })
  scheduledBy!: User;

  @Column()
  scheduledById!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}