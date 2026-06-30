import { z } from "zod";

export const CreateUserSchema = z.object({
    username: z.string(),
    password: z.string().min(3)
});

export const CreateAvatarSchema = z.object({
    name: z.string(),
    image: z.string(),
})