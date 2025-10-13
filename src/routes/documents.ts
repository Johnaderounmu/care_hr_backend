import { Router, Request, Response } from 'express';
import { DocumentService } from '../services/DocumentService';
import { authenticateToken } from '../middleware/auth';
import { Document, DocumentType, DocumentStatus } from '../entities/Document';

const router = Router();
const documentService = new DocumentService();

// Upload a document
router.post('/upload', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { filename, originalName, mimeType, size, url, type, description, jobApplicationId } = req.body;
    
    const document = await documentService.createDocument({
      filename,
      originalName,
      mimeType,
      size,
      url,
      type,
      uploadedById: userId,
      status: DocumentStatus.PENDING,
      description,
      jobApplicationId
    });
    
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get documents for current user
router.get('/my-documents', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const documents = await documentService.getUserDocuments(userId);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get all documents (HR only)
router.get('/all', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (!['hr_admin', 'hr_manager', 'recruiter'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const filters = {
      status: req.query.status as DocumentStatus,
      type: req.query.type as DocumentType,
      uploadedById: req.query.uploadedById as string,
    };
    
    const documents = await documentService.getAllDocuments(filters);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update document status (HR only)
router.put('/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (!['hr_admin', 'hr_manager', 'recruiter'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { id } = req.params;
    const { status, reviewNotes } = req.body;
    const reviewedBy = (req as any).user.id;
    
    const document = await documentService.updateDocumentStatus(id, status, reviewedBy, reviewNotes);
    res.json(document);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get document by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    const document = await documentService.getDocumentById(id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check if user can access this document
    const canAccess = document.uploadedById === userId || 
                     ['hr_admin', 'hr_manager', 'recruiter'].includes(userRole);
    
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete document
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    const document = await documentService.getDocumentById(id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check if user can delete this document
    const canDelete = document.uploadedById === userId || 
                     ['hr_admin', 'hr_manager'].includes(userRole);
    
    if (!canDelete) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await documentService.deleteDocument(id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;