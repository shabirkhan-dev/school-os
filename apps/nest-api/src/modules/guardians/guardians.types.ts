import type { GuardianRecord, StudentGuardianRecord, StudentRecord } from '@/database/schema';

export type PublicGuardian = {
	id: string;
	firstName: string;
	lastName: string;
	fullName: string;
	email: string | null;
	phone: string | null;
	alternatePhone: string | null;
	addressLine1: string | null;
	addressLine2: string | null;
	city: string | null;
	state: string | null;
	postalCode: string | null;
	country: string | null;
	occupation: string | null;
	preferredChannel: GuardianRecord['preferredChannel'];
	membershipId: string | null;
};

export type PublicStudentGuardianLink = {
	id: string;
	studentId: string;
	guardianId: string;
	relationship: StudentGuardianRecord['relationship'];
	isPrimary: boolean;
	canPickup: boolean;
	receivesNotifications: boolean;
	guardian: PublicGuardian;
};

export type PublicLinkedStudent = {
	studentId: string;
	studentCode: string;
	firstName: string;
	lastName: string;
	fullName: string;
	status: StudentRecord['status'];
	admittedOn: string | null;
	relationship: StudentGuardianRecord['relationship'];
	isPrimary: boolean;
};

export function toPublicGuardian(guardian: GuardianRecord): PublicGuardian {
	return {
		id: guardian.id,
		firstName: guardian.firstName,
		lastName: guardian.lastName,
		fullName: `${guardian.firstName} ${guardian.lastName}`.trim(),
		email: guardian.email,
		phone: guardian.phone,
		alternatePhone: guardian.alternatePhone,
		addressLine1: guardian.addressLine1,
		addressLine2: guardian.addressLine2,
		city: guardian.city,
		state: guardian.state,
		postalCode: guardian.postalCode,
		country: guardian.country,
		occupation: guardian.occupation,
		preferredChannel: guardian.preferredChannel,
		membershipId: guardian.membershipId,
	};
}

export function toPublicStudentGuardianLink(input: {
	link: StudentGuardianRecord;
	guardian: GuardianRecord;
}): PublicStudentGuardianLink {
	return {
		id: input.link.id,
		studentId: input.link.studentId,
		guardianId: input.link.guardianId,
		relationship: input.link.relationship,
		isPrimary: input.link.isPrimary,
		canPickup: input.link.canPickup,
		receivesNotifications: input.link.receivesNotifications,
		guardian: toPublicGuardian(input.guardian),
	};
}

export function toPublicLinkedStudent(input: {
	link: StudentGuardianRecord;
	student: StudentRecord;
}): PublicLinkedStudent {
	return {
		studentId: input.student.id,
		studentCode: input.student.studentCode,
		firstName: input.student.firstName,
		lastName: input.student.lastName,
		fullName: `${input.student.firstName} ${input.student.lastName}`.trim(),
		status: input.student.status,
		admittedOn: input.student.admittedOn,
		relationship: input.link.relationship,
		isPrimary: input.link.isPrimary,
	};
}
