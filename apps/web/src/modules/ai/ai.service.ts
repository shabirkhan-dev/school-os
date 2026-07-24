import { apiClient } from "@/lib/api/client";

export type AssistMessage = {
	role: "user" | "assistant" | "system";
	content: string;
};

export type AssistResponse = {
	reply: string;
	provider: string;
	model: string;
};

export type AiStatus = {
	ok: boolean;
	provider?: string;
};

export const aiService = {
	status: (accessToken: string) => apiClient.get<AiStatus>("/ai/status", { accessToken }),
	assist: (
		accessToken: string,
		input: { messages: AssistMessage[]; context?: string },
	): Promise<AssistResponse> =>
		apiClient.post<AssistResponse>("/ai/assist", input, { accessToken }),
	draftAcademics: (
		accessToken: string,
		input: {
			kind: "homework" | "assessment";
			topic: string;
			subjectName?: string;
			sectionName?: string;
			gradeLevel?: string;
			durationMinutes?: number;
			maxScore?: number;
			assessmentType?: "quiz" | "test" | "exam";
			tone?: "standard" | "challenge" | "support";
		},
	) =>
		apiClient.post<{
			title: string;
			description: string;
			materials: string | null;
			instructions: string | null;
			provider: string;
			model: string;
		}>("/ai/academics/draft", input, { accessToken }),
};
