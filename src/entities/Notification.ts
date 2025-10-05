import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum NotificationType {
  APPLICATION_SUBMITTED = 'application_submitted',
  APPLICATION_STATUS_CHANGED = 'application_status_changed',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  DOCUMENT_REVIEWED = 'document_reviewed',
  JOB_POSTED = 'job_posted',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  message!: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type!: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority!: NotificationPriority;

  @Column({ default: false })
  isRead!: boolean;

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'triggeredById' })
  triggeredBy?: User;

  @Column({ nullable: true })
  triggeredById?: string;

  @CreateDateColumn()
  createdAt!: Date;
}