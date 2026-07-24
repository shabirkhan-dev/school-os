export { AcademicGradesPage } from "./components/academic-grades-page";
export { AcademicPageShell } from "./components/academic-page-shell";
export { AcademicSectionsPage } from "./components/academic-sections-page";
export { AcademicYearsPage } from "./components/academic-years-page";
export { AcademicsHubPage } from "./components/academics-hub-page";
export {
	useAcademicYearsQuery,
	useClassesQuery,
	useCreateAcademicYearMutation,
	useCreateClassMutation,
	useCreateSectionMutation,
	useDeleteAcademicYearMutation,
	useDeleteClassMutation,
	useDeleteSectionMutation,
	useSectionsQuery,
	useUpdateAcademicYearMutation,
	useUpdateClassMutation,
	useUpdateSectionMutation,
} from "./hooks/use-academic-queries";
export type * from "./types/academic.types";
export { formatSectionLabel } from "./utils/format-section-label";
