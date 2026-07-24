import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import type { ApiErrorResponse } from '@/common/types/api-response.type';
import type { RequestWithId } from '@/common/types/request-with-id.type';

type HttpExceptionPayload = {
	code?: string;
	message?: string | string[];
	error?: string;
	errors?: ReadonlyArray<unknown>;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const http = host.switchToHttp();
		const request = http.getRequest<RequestWithId>();
		const response = http.getResponse<Response>();
		const statusCode = getStatusCode(exception);
		const payload = getExceptionPayload(exception);

		if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR && !(exception instanceof HttpException)) {
			this.logger.error(
				`${request.method} ${getRequestPath(request)}`,
				exception instanceof Error ? exception.stack : String(exception),
			);
		}

		const body: ApiErrorResponse = {
			success: false,
			statusCode,
			code: payload.code ?? getErrorCode(statusCode),
			message: getErrorMessage(exception, payload, statusCode),
			requestId: request.requestId ?? 'req_unknown',
			timestamp: new Date().toISOString(),
			path: getRequestPath(request),
			method: request.method,
			...(payload.errors ? { errors: payload.errors } : {}),
			...(getDevErrorDetail(exception) ? { detail: getDevErrorDetail(exception) } : {}),
		};

		response.status(statusCode).json(body);
	}
}

function getDevErrorDetail(exception: unknown): string | undefined {
	if (process.env.NODE_ENV === 'production') {
		return undefined;
	}
	if (exception instanceof HttpException) {
		return undefined;
	}
	if (exception instanceof Error) {
		return exception.message;
	}
	return undefined;
}

function getStatusCode(exception: unknown): number {
	return exception instanceof HttpException
		? exception.getStatus()
		: HttpStatus.INTERNAL_SERVER_ERROR;
}

function getExceptionPayload(exception: unknown): HttpExceptionPayload {
	if (!(exception instanceof HttpException)) {
		return {};
	}

	const response = exception.getResponse();

	if (typeof response === 'string') {
		return { message: response };
	}

	return isRecord(response) ? response : {};
}

function getErrorMessage(
	exception: unknown,
	payload: HttpExceptionPayload,
	statusCode: number,
): string {
	if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR && !(exception instanceof HttpException)) {
		return 'Internal server error';
	}

	if (typeof payload.message === 'string') {
		return payload.message;
	}

	if (Array.isArray(payload.message) && payload.message.length > 0) {
		return payload.message.join('; ');
	}

	if (typeof payload.error === 'string') {
		return payload.error;
	}

	return HttpStatus[statusCode] ?? 'Error';
}

function getErrorCode(statusCode: number): string {
	return HttpStatus[statusCode] ?? 'ERROR';
}

function getRequestPath(request: Request): string {
	return request.originalUrl || request.url;
}

function isRecord(value: unknown): value is HttpExceptionPayload {
	return typeof value === 'object' && value !== null;
}
