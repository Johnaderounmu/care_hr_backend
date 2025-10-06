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

export enum DocumentType {
  RESUME = 'resume',
  COVER_LETTER = 'cover_letter',
  PORTFOLIO = 'portfolio',
  CERTIFICATE = 'certificate',
  ID_DOCUMENT = 'id_document',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_UPDATE = 'requires_update',
}

@Entity()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  filename!: string;

  @Column()
  originalName!: string;

  @Column()
  mimeType!: string;

  @Column('bigint')
  size!: number;

  @Column()
  url!: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  type!: DocumentType;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status!: DocumentStatus;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text', { nullable: true })
  reviewNotes?: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy!: User;

  @Column()
  uploadedById!: string;

  @ManyToOne('JobApplication', 'documents', { nullable: true })
  @JoinColumn({ name: 'jobApplicationId' })
  jobApplication?: import('./JobApplication').JobApplication;

  @Column({ nullable: true })
  jobApplicationId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewedById' })
  reviewedBy?: User;

  @Column({ nullable: true })
  reviewedById?: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}