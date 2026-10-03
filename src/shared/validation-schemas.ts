import { z } from "zod";

// Profile schemas
export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  githubUsername: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

// Event schemas
export const eventSchema = z.object({
  title: z.string().min(5, "Event title must be at least 5 characters long"),
  description: z.string().min(20, "Description must be at least 20 characters long"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  location: z.string().min(1, "Please enter a location"),
  maxAttendees: z.number().min(1, "Maximum attendees must be at least 1"),
  type: z.enum(["workshop", "hackathon", "meetup", "conference"]),
});

// Type exports
export type ProfileFormData = z.infer<typeof profileSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
