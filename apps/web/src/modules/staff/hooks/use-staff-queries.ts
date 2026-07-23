"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/context/auth-context";
import { staffService } from "../services/staff.service";
import type {
	AssignSectionSubjectInput,
	CreateSubjectInput,
	Subject,
	TeacherDetail,
	TeacherSectionStudent,
	TeacherSummary,
	UpsertStaffProfileInput,
} from "../types/staff.types";

export function useTeachersQuery(tenantId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: ["staff", tenantId, "teachers"],
		queryFn: () => {
			if (!tenantId || !token) throw new Error("Auth required");
			return staffService.listTeachers(token, tenantId).then((r) => r.teachers as TeacherSummary[]);
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function useTeacherQuery(
	tenantId: string | null,
	membershipId: string | null,
	enabled = true,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: ["staff", tenantId, "teacher", membershipId],
		queryFn: () => {
			if (!tenantId || !token || !membershipId) throw new Error("Auth required");
			return staffService.getTeacher(token, tenantId, membershipId) as Promise<TeacherDetail>;
		},
		enabled: enabled && Boolean(token && tenantId && membershipId),
	});
}

export function useMyTeacherDashboardQuery(
	tenantId: string | null,
	sessionDate: string,
	enabled = true,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: ["staff", tenantId, "me", "dashboard", sessionDate],
		queryFn: () => {
			if (!tenantId || !token) throw new Error("Auth required");
			return staffService.getMyTeacherDashboard(token, tenantId, sessionDate);
		},
		enabled: enabled && Boolean(token && tenantId && sessionDate),
	});
}

export function useMyTeacherProfileQuery(tenantId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: ["staff", tenantId, "me"],
		queryFn: () => {
			if (!tenantId || !token) throw new Error("Auth required");
			return staffService.getMyTeacherProfile(token, tenantId) as Promise<TeacherDetail>;
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function useMySectionStudentsQuery(
	tenantId: string | null,
	sectionId: string | null,
	enabled = true,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: ["staff", tenantId, "me", "sections", sectionId, "students"],
		queryFn: () => {
			if (!tenantId || !token || !sectionId) throw new Error("Auth required");
			return staffService
				.getMySectionStudents(token, tenantId, sectionId)
				.then((response) => response.students as TeacherSectionStudent[]);
		},
		enabled: enabled && Boolean(token && tenantId && sectionId),
	});
}

export function useUpsertMyTeacherProfileMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpsertStaffProfileInput) => {
			if (!token) throw new Error("Auth required");
			return staffService.upsertMyProfile(token, tenantId, input);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["staff", tenantId, "me"] });
		},
	});
}

export function useUpsertTeacherProfileMutation(tenantId: string, membershipId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpsertStaffProfileInput) => {
			if (!token) throw new Error("Auth required");
			return staffService.upsertProfile(token, tenantId, membershipId, input);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["staff", tenantId] });
		},
	});
}

export function useSubjectsQuery(tenantId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: ["staff", tenantId, "subjects"],
		queryFn: () => {
			if (!tenantId || !token) throw new Error("Auth required");
			return staffService.listSubjects(token, tenantId).then((r) => r.subjects as Subject[]);
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function useCreateSubjectMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateSubjectInput) => {
			if (!token) throw new Error("Auth required");
			return staffService.createSubject(token, tenantId, input);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["staff", tenantId, "subjects"] });
		},
	});
}

export function useAssignSectionSubjectMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: AssignSectionSubjectInput) => {
			if (!token) throw new Error("Auth required");
			return staffService.assignSectionSubject(token, tenantId, input);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["staff", tenantId] });
		},
	});
}
