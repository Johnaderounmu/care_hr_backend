import { AppDataSource } from '../data-source';
import { Notification, NotificationType, NotificationPriority } from '../entities/Notification';
import { User } from '../entities/User';
import { Repository } from 'typeorm';

export class NotificationService {
  private notificationRepository: Repository<Notification>;
  private userRepository: Repository<User>;

  constructor() {
    this.notificationRepository = AppDataSource.getRepository(Notification);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    priority?: NotificationPriority;
    actionUrl?: string;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...data,
      type: data.type || NotificationType.SYSTEM_ANNOUNCEMENT,
      priority: data.priority || NotificationPriority.MEDIUM,
      isRead: false
    });

    return await this.notificationRepository.save(notification);
  }

  async getUserNotifications(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
    } = {}
  ): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (options.unreadOnly) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead: false });
    }

    const [notifications, total] = await Promise.all([
      queryBuilder.skip(offset).take(limit).getMany(),
      queryBuilder.getCount()
    ]);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;

    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true }
    );
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId
    });

    if (result.affected === 0) {
      throw new Error('Notification not found');
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, isRead: false }
    });
  }

  // Utility methods for specific notification types
  async notifyApplicationReceived(applicantId: string, jobTitle: string): Promise<Notification> {
    return this.createNotification({
      userId: applicantId,
      title: 'Application Received',
      message: `Your application for ${jobTitle} has been received and is under review.`,
      type: NotificationType.APPLICATION_SUBMITTED,
      priority: NotificationPriority.MEDIUM
    });
  }

  async notifyApplicationStatusChanged(
    applicantId: string, 
    jobTitle: string, 
    status: string
  ): Promise<Notification> {
    return this.createNotification({
      userId: applicantId,
      title: 'Application Status Update',
      message: `Your application for ${jobTitle} status has been updated to: ${status}.`,
      type: NotificationType.APPLICATION_STATUS_CHANGED,
      priority: NotificationPriority.HIGH
    });
  }

  async notifyInterviewScheduled(
    applicantId: string,
    jobTitle: string,
    interviewDate: Date
  ): Promise<Notification> {
    return this.createNotification({
      userId: applicantId,
      title: 'Interview Scheduled',
      message: `An interview has been scheduled for ${jobTitle} on ${interviewDate.toLocaleDateString()}.`,
      type: NotificationType.INTERVIEW_SCHEDULED,
      priority: NotificationPriority.HIGH
    });
  }

  async notifyDocumentReviewed(
    uploaderId: string,
    documentName: string,
    status: string
  ): Promise<Notification> {
    return this.createNotification({
      userId: uploaderId,
      title: 'Document Reviewed',
      message: `Your document "${documentName}" has been ${status.toLowerCase()}.`,
      type: NotificationType.DOCUMENT_REVIEWED,
      priority: NotificationPriority.MEDIUM
    });
  }

  async notifyNewApplication(hrUserId: string, applicantName: string, jobTitle: string): Promise<Notification> {
    return this.createNotification({
      userId: hrUserId,
      title: 'New Application Received',
      message: `${applicantName} has applied for ${jobTitle}.`,
      type: NotificationType.APPLICATION_SUBMITTED,
      priority: NotificationPriority.MEDIUM
    });
  }

  async notifyNewDocument(hrUserId: string, applicantName: string, documentType: string): Promise<Notification> {
    return this.createNotification({
      userId: hrUserId,
      title: 'New Document Uploaded',
      message: `${applicantName} has uploaded a new ${documentType}.`,
      type: NotificationType.DOCUMENT_REVIEWED,
      priority: NotificationPriority.LOW
    });
  }
}