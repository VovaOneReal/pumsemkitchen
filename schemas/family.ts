import { z } from 'zod'

export const createFamilySchema = z.object({
  title: z.string().min(1, 'Название не может быть пустым').max(128, 'Название не может быть длиннее 128 символов'),
})

export const updateFamilySchema = z.object({
  title: z.string().min(1, 'Название не может быть пустым').max(128, 'Название не может быть длиннее 128 символов'),
})

export const inviteToFamilySchema = z.object({
  login: z.string().min(1, 'Логин не может быть пустым').max(32, 'Логин не может быть длиннее 32 символов'),
})

export const kickMemberSchema = z.object({
  userId: z.number().int().positive(),
})

export const respondInviteSchema = z.object({
  accept: z.boolean(),
})

export type CreateFamilyForm = z.infer<typeof createFamilySchema>
export type UpdateFamilyForm = z.infer<typeof updateFamilySchema>
export type InviteToFamilyForm = z.infer<typeof inviteToFamilySchema>
