ALTER TABLE "students"
	ADD COLUMN "membership_id" uuid;
--> statement-breakpoint
ALTER TABLE "students"
	ADD CONSTRAINT "students_membership_id_memberships_id_fk"
	FOREIGN KEY ("membership_id") REFERENCES "memberships"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE UNIQUE INDEX "students_membership_id_unique" ON "students" ("membership_id")
WHERE "membership_id" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX "students_membership_id_idx" ON "students" ("membership_id");
