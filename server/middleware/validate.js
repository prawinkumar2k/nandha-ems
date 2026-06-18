import { z } from "zod";

/**
 * Express middleware to validate request bodies using Zod schemas.
 * Prevents NoSQL injection and ensures data integrity.
 * 
 * @param {z.ZodObject} schema - The Zod schema to validate against
 */
export const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      // Parse the incoming request body
      const parsedBody = await schema.parseAsync(req.body);
      // Replace req.body with the sanitized/parsed data to strip unknown fields
      req.body = parsedBody;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format the errors for the client
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          message: "Validation failed",
          errors: validationErrors
        });
      }
      next(error);
    }
  };
};

// --- Common Schemas ---

export const schemas = {
  // Login payload validation
  login: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    deviceId: z.string().optional(),
    machineFingerprint: z.string().optional(),
    fcmToken: z.string().optional()
  }),
  
  // Create User validation
  createUser: z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["admin", "hod", "faculty", "student"]),
    rollNumber: z.string().optional(),
    employeeId: z.string().optional(),
    department: z.string().optional()
  }),

  // Submit Exam Answers validation
  updateAnswers: z.object({
    answers: z.record(z.string(), z.string()).optional(),
    violations: z.array(z.object({
      type: z.string(),
      timestamp: z.string().optional()
    })).optional()
  })
};
