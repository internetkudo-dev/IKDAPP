import { z } from 'zod';

export const createForgotPasswordSchema = (t?: any) => z.object({
    email: z.string().email(),
});
export const forgotPasswordSchema = createForgotPasswordSchema();
