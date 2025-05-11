// Zod schemas
import { z } from "zod";

export const bookingSchema = z.object({
  quoteId: z.number().min(1),
  clientId: z.number().min(1),
  travelDate: z.date().min(new Date()),
});
