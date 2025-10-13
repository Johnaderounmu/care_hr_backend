import { Router, Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const notificationService = new NotificationService();

// Get user notifications
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';
    
    const notifications = await notificationService.getUserNotifications(userId, {
      page,
      limit,
      unreadOnly
    });
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const notification = await notificationService.markAsRead(id, userId);
    res.json(notification);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    await notificationService.markAllAsRead(userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    await notificationService.deleteNotification(id, userId);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get notification count
router.get('/count', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const count = await notificationService.getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create notification (admin only)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (!['hr_admin', 'hr_manager'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { userId, title, message, type, priority, actionUrl } = req.body;
    
    const notification = await notificationService.createNotification({
      userId,
      title,
      message,
      type,
      priority,
      actionUrl
    });
    
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;