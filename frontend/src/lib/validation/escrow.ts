import { z } from "zod";

export const createEscrowSchema = z.object({
  seller: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid seller address"),

  arbiter: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid arbiter address"),

  token: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid token address"),

  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d+)?$/, "Invalid amount")
    .refine((value) => Number(value) > 0, "Amount must be greater than 0"),
});

export const openEscrowSchema = z.object({
  escrowId: z
    .string()
    .trim()
    .min(1, "Escrow ID is required")
    .regex(/^\d+$/, "Escrow ID must be a number"),
});

export type CreateEscrowInput = z.infer<typeof createEscrowSchema>;
export type OpenEscrowInput = z.infer<typeof openEscrowSchema>;
