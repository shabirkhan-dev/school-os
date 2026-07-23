"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/context/auth-context";
import { academicQueryKeys } from "../queries/academic-query-keys";
import { academicService } from "../services/academic.service";
import type {
	AcademicYear,
	CreateAcademicYearInput,
	CreateClassInput,
	CreateSectionInput,
	SchoolClass,
	Section,
} from "../types/academic.types";

function requireToken(token: string | null): string {
	if (!token) throw new Error("Authentication required");
	return token;
}

export function useAcademicYearsQuery(tenantId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: academicQueryKeys.years(tenantId ?? ""),
		queryFn: () => {
			if (!tenantId) throw new Error("Tenant id required");
			return academicService.listYears(requireToken(token), tenantId).then((r) => r.academicYears);
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function useClassesQuery(tenantId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: academicQueryKeys.classes(tenantId ?? ""),
		queryFn: () => {
			if (!tenantId) throw new Error("Tenant id required");
			return academicService.listClasses(requireToken(token), tenantId).then((r) => r.classes);
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function useSectionsQuery(tenantId: string | null, campusId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: academicQueryKeys.sections(tenantId ?? "", campusId),
		queryFn: () => {
			if (!tenantId) throw new Error("Tenant id required");
			return academicService
				.listSections(requireToken(token), tenantId, campusId ? { campusId } : undefined)
				.then((r) => r.sections);
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function useCreateAcademicYearMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateAcademicYearInput) =>
			academicService.createYear(requireToken(token), tenantId, input),
		onSuccess: async (data) => {
			queryClient.setQueryData<AcademicYear[]>(academicQueryKeys.years(tenantId), (current) => {
				const years = current ?? [];
				if (years.some((year) => year.id === data.academicYear.id)) return years;
				return [...years, data.academicYear];
			});
			await queryClient.invalidateQueries({ queryKey: academicQueryKeys.years(tenantId) });
		},
	});
}

export function useCreateClassMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateClassInput) =>
			academicService.createClass(requireToken(token), tenantId, input),
		onSuccess: async (data) => {
			queryClient.setQueryData<SchoolClass[]>(academicQueryKeys.classes(tenantId), (current) => {
				const classes = current ?? [];
				if (classes.some((item) => item.id === data.class.id)) return classes;
				return [...classes, data.class];
			});
			await queryClient.invalidateQueries({ queryKey: academicQueryKeys.classes(tenantId) });
		},
	});
}

export function useCreateSectionMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateSectionInput) =>
			academicService.createSection(requireToken(token), tenantId, input),
		onSuccess: async (data) => {
			queryClient.setQueryData<Section[]>(
				academicQueryKeys.sections(tenantId, data.section.campusId),
				(current) => {
					const sections = current ?? [];
					if (sections.some((section) => section.id === data.section.id)) return sections;
					return [...sections, data.section];
				},
			);
			await queryClient.invalidateQueries({
				queryKey: academicQueryKeys.sections(tenantId, data.section.campusId),
			});
		},
	});
}
