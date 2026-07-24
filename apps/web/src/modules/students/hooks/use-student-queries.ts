"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requireToken } from "@/lib/api/require-token";
import { useAuth } from "@/modules/auth/context/auth-context";
import { studentQueryKeys } from "../queries/student-query-keys";
import { studentsService } from "../services/students.service";
import type {
	CreateEnrollmentInput,
	CreateStudentInput,
	Enrollment,
	Student,
} from "../types/student.types";

export function useStudentsQuery(tenantId: string | null, campusId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: studentQueryKeys.list(tenantId ?? "", campusId),
		queryFn: () => {
			if (!tenantId) throw new Error("Tenant id required");
			return studentsService
				.list(requireToken(token), tenantId, campusId ? { campusId } : undefined)
				.then((response) => response.students);
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function useStudentQuery(tenantId: string | null, studentId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: studentQueryKeys.detail(tenantId ?? "", studentId ?? ""),
		queryFn: () => {
			if (!tenantId || !studentId) throw new Error("Tenant and student id required");
			return studentsService.get(requireToken(token), tenantId, studentId);
		},
		enabled: enabled && Boolean(token && tenantId && studentId),
	});
}

export function useTenantEnrollmentsQuery(
	tenantId: string | null,
	academicYearId: string | null,
	enabled = true,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: studentQueryKeys.tenantEnrollments(tenantId ?? "", academicYearId ?? ""),
		queryFn: () => {
			if (!tenantId) throw new Error("Tenant id required");
			return studentsService
				.listEnrollments(requireToken(token), tenantId, {
					academicYearId: academicYearId ?? undefined,
				})
				.then((response) => response.enrollments);
		},
		enabled: enabled && Boolean(token && tenantId && academicYearId),
	});
}

export function useStudentEnrollmentsQuery(
	tenantId: string | null,
	studentId: string | null,
	enabled = true,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: studentQueryKeys.enrollments(tenantId ?? "", studentId ?? ""),
		queryFn: () => {
			if (!tenantId || !studentId) throw new Error("Tenant and student id required");
			return studentsService
				.listEnrollments(requireToken(token), tenantId, { studentId })
				.then((response) => response.enrollments);
		},
		enabled: enabled && Boolean(token && tenantId && studentId),
	});
}

export function useSectionEnrollmentsQuery(
	tenantId: string | null,
	sectionId: string | null,
	enabled = true,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: ["students", "section-enrollments", tenantId ?? "", sectionId ?? ""] as const,
		queryFn: () => {
			if (!tenantId || !sectionId) throw new Error("Tenant and section id required");
			return studentsService
				.listEnrollments(requireToken(token), tenantId, { sectionId })
				.then((response) => response.enrollments);
		},
		enabled: enabled && Boolean(token && tenantId && sectionId),
	});
}

export function useCreateStudentMutation(tenantId: string, campusId: string | null) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateStudentInput) =>
			studentsService.create(requireToken(token), tenantId, input),
		onSuccess: async (data) => {
			queryClient.setQueryData<Student[]>(studentQueryKeys.list(tenantId, campusId), (current) => {
				const students = current ?? [];
				if (students.some((student) => student.id === data.student.id)) return students;
				return [...students, data.student];
			});
			await queryClient.invalidateQueries({
				queryKey: studentQueryKeys.list(tenantId, campusId),
			});
		},
	});
}

export function useUploadStudentPhotoMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ studentId, file }: { studentId: string; file: File }) =>
			studentsService.uploadPhoto(requireToken(token), tenantId, studentId, file),
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({
				queryKey: studentQueryKeys.detail(tenantId, data.student.id),
			});
			await queryClient.invalidateQueries({
				queryKey: studentQueryKeys.list(tenantId, data.student.campusId),
			});
		},
	});
}

export function useCreateEnrollmentMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ studentId, input }: { studentId: string; input: CreateEnrollmentInput }) =>
			studentsService.createEnrollment(requireToken(token), tenantId, studentId, input),
		onSuccess: async (data) => {
			queryClient.setQueryData<Enrollment[]>(
				studentQueryKeys.enrollments(tenantId, data.enrollment.studentId),
				(current) => {
					const enrollments = current ?? [];
					if (enrollments.some((enrollment) => enrollment.id === data.enrollment.id)) {
						return enrollments;
					}
					return [...enrollments, data.enrollment];
				},
			);
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: studentQueryKeys.enrollments(tenantId, data.enrollment.studentId),
				}),
				queryClient.invalidateQueries({
					queryKey: [...studentQueryKeys.all, tenantId, "tenant-enrollments"],
				}),
			]);
		},
	});
}

export function useMyStudentProfileQuery(tenantId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: studentQueryKeys.myProfile(tenantId ?? ""),
		queryFn: () => {
			if (!tenantId) throw new Error("Tenant id required");
			return studentsService.getMyProfile(requireToken(token), tenantId);
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}
