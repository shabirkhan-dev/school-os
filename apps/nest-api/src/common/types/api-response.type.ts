export type ApiSuccessResponse<TData> = {
	success: true;
	statusCode: number;
	requestId: string;
	timestamp: string;
	data: TData;
};

export type ApiErrorResponse = {
	success: false;
	statusCode: number;
	code: string;
	message: string;
	requestId: string;
	timestamp: string;
	path: string;
	method: string;
	errors?: ReadonlyArray<unknown>;
	/** Present in non-production when an unhandled error is mapped to 500. */
	detail?: string;
};
