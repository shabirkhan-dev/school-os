"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/context/auth-context";
import { tenantQueryKeys } from "../queries/tenant-query-keys";
import { createCampusSchema, createTenantSchema } from "../schemas/tenant.schemas";
import { campusesService } from "../services/campuses.service";
import { tenantsService } from "../services/tenants.service";
import type {
	Campus,
	CreateCampusInput,
	CreateTenantInput,
	Tenant,
	UpdateTenantInput,
} from "../types/tenant.types";

function requireToken(token: string | null): string {
	if (!token) throw new Error("Authentication required");
	return token;
}

function normalizeTenantInput(input: CreateTenantInput): CreateTenantInput {
	return {
		name: input.name.trim(),
		...(input.slug?.trim() ? { slug: input.slug.trim() } : {}),
		...(input.mission?.trim() ? { mission: input.mission.trim() } : {}),
		...(input.timezone?.trim() ? { timezone: input.timezone.trim() } : {}),
		...(input.defaultLocale?.trim() ? { defaultLocale: input.defaultLocale.trim() } : {}),
	};
}

function normalizeCampusInput(input: CreateCampusInput): CreateCampusInput {
	return {
		name: input.name.trim(),
		code: input.code.trim(),
		...(input.address?.trim() ? { address: input.address.trim() } : {}),
	};
}

export function useCreateTenantMutation() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateTenantInput) =>
			tenantsService.create(
				requireToken(token),
				normalizeTenantInput(createTenantSchema.parse(input)),
			),
		onSuccess: async (data) => {
			queryClient.setQueryData<Tenant[]>(tenantQueryKeys.list(), (current) => {
				const tenants = current ?? [];
				if (tenants.some((tenant) => tenant.id === data.tenant.id)) return tenants;
				return [...tenants, data.tenant];
			});
			await queryClient.invalidateQueries({ queryKey: tenantQueryKeys.all });
		},
	});
}

export function useCreateCampusMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateCampusInput) =>
			campusesService.create(
				requireToken(token),
				tenantId,
				normalizeCampusInput(createCampusSchema.parse(input)),
			),
		onSuccess: async (data) => {
			queryClient.setQueryData<Campus[]>(tenantQueryKeys.campuses(tenantId), (current) => {
				const campuses = current ?? [];
				if (campuses.some((campus) => campus.id === data.campus.id)) return campuses;
				return [...campuses, data.campus];
			});
			await queryClient.invalidateQueries({ queryKey: tenantQueryKeys.campuses(tenantId) });
		},
	});
}

export function useUpdateTenantMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpdateTenantInput) =>
			tenantsService.update(requireToken(token), tenantId, input),
		onSuccess: async (data) => {
			queryClient.setQueryData<Tenant>(tenantQueryKeys.detail(tenantId), data.tenant);
			queryClient.setQueryData<Tenant[]>(tenantQueryKeys.list(), (current) => {
				const tenants = current ?? [];
				return tenants.map((tenant) => (tenant.id === data.tenant.id ? data.tenant : tenant));
			});
			await queryClient.invalidateQueries({ queryKey: tenantQueryKeys.detail(tenantId) });
			await queryClient.invalidateQueries({ queryKey: tenantQueryKeys.list() });
		},
	});
}
