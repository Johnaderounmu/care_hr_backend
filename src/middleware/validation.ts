import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Generic validation middleware
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      logger.warn('Validation error', { 
        error: error.details,
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])')).required()
      .messages({
        'string.pattern.base': 'Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character'
      }),
    fullName: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('hr_admin', 'applicant').default('applicant')
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  updateProfile: Joi.object({
    fullName: Joi.string().min(2).max(100),
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow(null),
    profileImageUrl: Joi.string().uri().allow(null)
  })
};

// Job validation schemas
export const jobSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).max(5000).required(),
    department: Joi.string().min(2).max(100).required(),
    location: Joi.string().min(2).max(200).required(),
    salaryRange: Joi.string().max(100),
    requirements: Joi.array().items(Joi.string().max(500)),
    benefits: Joi.array().items(Joi.string().max(500)),
    employmentType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP').required(),
    experienceLevel: Joi.string().valid('ENTRY', 'MID', 'SENIOR', 'EXECUTIVE').required(),
    isActive: Joi.boolean().default(true),
    applicationDeadline: Joi.date().greater('now')
  }),
  
  update: Joi.object({
    title: Joi.string().min(3).max(200),
    description: Joi.string().min(10).max(5000),
    department: Joi.string().min(2).max(100),
    location: Joi.string().min(2).max(200),
    salaryRange: Joi.string().max(100),
    requirements: Joi.array().items(Joi.string().max(500)),
    benefits: Joi.array().items(Joi.string().max(500)),
    employmentType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'),
    experienceLevel: Joi.string().valid('ENTRY', 'MID', 'SENIOR', 'EXECUTIVE'),
    isActive: Joi.boolean(),
    applicationDeadline: Joi.date().greater('now')
  })
};

// Application validation schemas
export const applicationSchemas = {
  create: Joi.object({
    jobId: Joi.string().uuid().required(),
    coverLetter: Joi.string().min(50).max(2000),
    resumeUrl: Joi.string().uri(),
    additionalDocuments: Joi.array().items(Joi.string().uri())
  }),
  
  updateStatus: Joi.object({
    status: Joi.string().valid('PENDING', 'REVIEWING', 'INTERVIEW_SCHEDULED', 'REJECTED', 'ACCEPTED').required(),
    notes: Joi.string().max(1000)
  })
};