import { AppDataSource } from '../data-source';
import { Document, DocumentType, DocumentStatus } from '../entities/Document';
import { User } from '../entities/User';
import { Repository } from 'typeorm';

export class DocumentService {
  private documentRepository: Repository<Document>;
  private userRepository: Repository<User>;

  constructor() {
    this.documentRepository = AppDataSource.getRepository(Document);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createDocument(documentData: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    type: DocumentType;
    uploadedById: string;
    status: DocumentStatus;
    description?: string;
    jobApplicationId?: string;
  }): Promise<Document> {
    const document = this.documentRepository.create(documentData);
    return await this.documentRepository.save(document);
  }

  async getUserDocuments(userId: string): Promise<Document[]> {
    return await this.documentRepository.find({
      where: { uploadedById: userId },
      relations: ['uploadedBy', 'reviewedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async getAllDocuments(filters: {
    status?: DocumentStatus;
    type?: DocumentType;
    uploadedById?: string;
  }): Promise<Document[]> {
    const queryBuilder = this.documentRepository.createQueryBuilder('document')
      .leftJoinAndSelect('document.uploadedBy', 'uploadedBy')
      .leftJoinAndSelect('document.reviewedBy', 'reviewedBy');

    if (filters.status) {
      queryBuilder.andWhere('document.status = :status', { status: filters.status });
    }

    if (filters.type) {
      queryBuilder.andWhere('document.type = :type', { type: filters.type });
    }

    if (filters.uploadedById) {
      queryBuilder.andWhere('document.uploadedById = :uploadedById', { uploadedById: filters.uploadedById });
    }

    return await queryBuilder.orderBy('document.createdAt', 'DESC').getMany();
  }

  async getDocumentById(id: string): Promise<Document | null> {
    return await this.documentRepository.findOne({
      where: { id },
      relations: ['uploadedBy', 'reviewedBy']
    });
  }

  async updateDocumentStatus(
    id: string, 
    status: DocumentStatus, 
    reviewedById: string, 
    reviewNotes?: string
  ): Promise<Document> {
    const document = await this.getDocumentById(id);
    if (!document) {
      throw new Error('Document not found');
    }

    document.status = status;
    document.reviewedById = reviewedById;
    document.reviewNotes = reviewNotes;
    document.reviewedAt = new Date();

    return await this.documentRepository.save(document);
  }

  async deleteDocument(id: string): Promise<void> {
    const result = await this.documentRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Document not found');
    }
  }

  async getDocumentsByApplicationId(applicationId: string): Promise<Document[]> {
    return await this.documentRepository.find({
      where: { jobApplicationId: applicationId },
      relations: ['uploadedBy', 'reviewedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async getDocumentStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byType: Record<DocumentType, number>;
  }> {
    const [total, pending, approved, rejected] = await Promise.all([
      this.documentRepository.count(),
      this.documentRepository.count({ where: { status: DocumentStatus.PENDING } }),
      this.documentRepository.count({ where: { status: DocumentStatus.APPROVED } }),
      this.documentRepository.count({ where: { status: DocumentStatus.REJECTED } })
    ]);

    // Get counts by type
    const byTypeResults = await this.documentRepository
      .createQueryBuilder('document')
      .select('document.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('document.type')
      .getRawMany();

    const byType: Record<DocumentType, number> = {} as Record<DocumentType, number>;
    Object.values(DocumentType).forEach(type => {
      byType[type] = 0;
    });

    byTypeResults.forEach(result => {
      byType[result.type as DocumentType] = parseInt(result.count);
    });

    return {
      total,
      pending,
      approved,
      rejected,
      byType
    };
  }
}