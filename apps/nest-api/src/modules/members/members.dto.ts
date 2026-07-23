import * as z from 'zod';

const emailSchema = z.email().trim().toLowerCase().max(320);
const membershipRoleSchema = z.enum(['principal', 'admin', 'teacher', 'parent', 'student']);

export const inviteMemberSchema = z
	.object({
		email: emailSchema,
		role: membershipRoleSchema,
		campusId: z.string().uuid().optional(),
	})
	.strict();

export class InviteMemberDto {
	static schema = inviteMemberSchema;
	email!: string;
	role!: z.infer<typeof membershipRoleSchema>;
	campusId?: string;
}

export const updateMemberSchema = z
	.object({
		role: z.enum(['owner', 'principal', 'admin', 'teacher', 'parent', 'student']).optional(),
		status: z.enum(['active', 'invited', 'suspended']).optional(),
		campusId: z.string().uuid().nullable().optional(),
	})
	.strict()
	.refine((value) => Object.keys(value).length > 0, {
		message: 'At least one field is required',
	});

export class UpdateMemberDto {
	static schema = updateMemberSchema;
	role?: 'owner' | 'principal' | 'admin' | 'teacher' | 'parent' | 'student';
	status?: 'active' | 'invited' | 'suspended';
	campusId?: string | null;
}

export const acceptInviteSchema = z.object({ token: z.string().min(20).max(512) }).strict();

export class AcceptInviteDto {
	static schema = acceptInviteSchema;
	token!: string;
}

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
