interface ApiSuccess<T> {
	success: true;
	statusCode: number;
	data: T;
}

interface ApiFailure {
	success: false;
	statusCode: number;
	code?: string;
	message?: string;
	errors?: ReadonlyArray<{ path?: string; message?: string }>;
}

export class ApiError extends Error {
	constructor(
		message: string,
		readonly statusCode: number,
		readonly code?: string,
		readonly issues?: ApiFailure["errors"],
	) {
		super(message);
		this.name = "ApiError";
	}
}

const apiOrigin = resolveApiOrigin(process.env.NEXT_PUBLIC_NEST_API_URL ?? "http://localhost:4000");
const apiPrefix = "/api/v1";

export type ApiRequestOptions = RequestInit & { accessToken?: string };

export const apiClient = {
	get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
		return request<T>(path, { ...options, method: "GET" });
	},
	post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
		return request<T>(path, {
			...options,
			method: "POST",
			...(body === undefined ? {} : { body: JSON.stringify(body) }),
		});
	},
	postForm<T>(path: string, body: FormData, options?: ApiRequestOptions): Promise<T> {
		return request<T>(path, { ...options, method: "POST", body }, { multipart: true });
	},
	patch<T>(path: string, body: unknown, options?: ApiRequestOptions): Promise<T> {
		return request<T>(path, { ...options, method: "PATCH", body: JSON.stringify(body) });
	},
	put<T>(path: string, body: unknown, options?: ApiRequestOptions): Promise<T> {
		return request<T>(path, { ...options, method: "PUT", body: JSON.stringify(body) });
	},
	delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
		return request<T>(path, { ...options, method: "DELETE" });
	},
};

export function getApiOrigin(): string {
	return apiOrigin;
}

async function request<T>(
	path: string,
	options: ApiRequestOptions = {},
	flags: { multipart?: boolean } = {},
): Promise<T> {
	const { accessToken, ...init } = options;
	const headers = new Headers(init.headers);
	if (init.body && !flags.multipart) headers.set("Content-Type", "application/json");
	if (init.method && init.method !== "GET") {
		headers.set("X-Requested-With", "XMLHttpRequest");
	}
	if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

	const response = await fetch(`${apiOrigin}${apiPrefix}${normalizePath(path)}`, {
		...init,
		headers,
		credentials: "include",
	});
	if (response.status === 204) return undefined as T;

	const payload: unknown = await response.json().catch(() => ({}));
	if (!response.ok) {
		const failure = payload as ApiFailure;
		throw new ApiError(
			typeof failure.message === "string"
				? failure.message
				: response.statusText || "Request failed",
			response.status,
			failure.code,
			failure.errors,
		);
	}
	return isSuccess<T>(payload) ? payload.data : (payload as T);
}

function resolveApiOrigin(value: string): string {
	try {
		return new URL(value).origin;
	} catch {
		throw new Error(`Invalid NEXT_PUBLIC_NEST_API_URL: ${value}`);
	}
}

function normalizePath(path: string): string {
	return path.startsWith("/") ? path : `/${path}`;
}

function isSuccess<T>(payload: unknown): payload is ApiSuccess<T> {
	return (
		typeof payload === "object" &&
		payload !== null &&
		"success" in payload &&
		payload.success === true &&
		"data" in payload
	);
}
