export type GuardianRelationship =
	| "father"
	| "mother"
	| "guardian"
	| "step_parent"
	| "grandparent"
	| "sibling"
	| "other";

export type Guardian = {
	id: string;
	firstName: string;
	lastName: string;
	fullName: string;
	email: string | null;
	phone: string | null;
	alternatePhone: string | null;
	occupation: string | null;
	preferredChannel: "email" | "phone" | "whatsapp" | "sms";
	membershipId: string | null;
};

export type LinkedStudent = {
	studentId: string;
	studentCode: string;
	firstName: string;
	lastName: string;
	fullName: string;
	status: "active" | "inactive" | "graduated" | "withdrawn";
	admittedOn: string | null;
	relationship: GuardianRelationship;
	isPrimary: boolean;
};

export type AdmissionGuardianInput = {
	firstName: string;
	lastName: string;
	email?: string;
	phone?: string;
	relationship: GuardianRelationship;
	isPrimary?: boolean;
};

export type CreateGuardianInput = {
	firstName: string;
	lastName: string;
	email?: string;
	phone?: string;
	alternatePhone?: string;
	occupation?: string;
	preferredChannel?: "email" | "phone" | "whatsapp" | "sms";
};

export type UpdateGuardianInput = Partial<CreateGuardianInput>;

export type LinkStudentGuardianInput = {
	guardianId?: string;
	guardian?: CreateGuardianInput;
	relationship: GuardianRelationship;
	isPrimary?: boolean;
	canPickup?: boolean;
	receivesNotifications?: boolean;
};
