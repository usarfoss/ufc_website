import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  githubUsername: z.string().optional(),
});

// Profile schemas
export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  githubUsername: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

// Project schemas
export const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  repositoryUrl: z.string().url('Please enter a valid repository URL').optional(),
  language: z.string().min(1, 'Please select a language'),
  status: z.enum(['planning', 'active', 'completed', 'archived']),
});

// Event schemas
export const eventSchema = z.object({
  title: z.string().min(5, 'Event title must be at least 5 characters long'),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  location: z.string().min(1, 'Please enter a location'),
  maxAttendees: z.number().min(1, 'Maximum attendees must be at least 1'),
  type: z.enum(['workshop', 'hackathon', 'meetup', 'conference']),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type EventFormData = z.infer<typeof eventSchema>;