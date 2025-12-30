
import { z } from 'zod';

export const createResetPasswordSchema = (t?: any) => z.object({
    code: z.string().min(4),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
