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

export const acceptInviteSchema = z
	.object({
		token: z.string().min(20).max(512).optional(),
		inviteId: z.string().uuid().optional(),
	})
	.strict()
	.refine((value) => Boolean(value.token ?? value.inviteId), {
		message: 'Either token or inviteId is required',
	});

export class AcceptInviteDto {
	static schema = acceptInviteSchema;
	token?: string;
	inviteId?: string;
}

export const addMemberRoleSchema = z
	.object({
		role: z.enum(['teacher', 'parent', 'student']),
	})
	.strict();

export class AddMemberRoleDto {
	static schema = addMemberRoleSchema;
	role!: 'teacher' | 'parent' | 'student';
}
export type AddMemberRoleInput = z.infer<typeof addMemberRoleSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
