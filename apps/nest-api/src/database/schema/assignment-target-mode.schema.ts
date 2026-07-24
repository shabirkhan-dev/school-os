import { pgEnum } from 'drizzle-orm/pg-core';

export const assignmentTargetMode = pgEnum('assignment_target_mode', [
	'whole_class',
	'selected_students',
]);
