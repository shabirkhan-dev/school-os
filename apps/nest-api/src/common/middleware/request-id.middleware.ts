import { randomUUID } from 'node:crypto';

import type { NextFunction, Response } from 'express';

import type { RequestWithId } from '@/common/types/request-with-id.type';

const requestIdHeader = 'x-request-id';

export function requestIdMiddleware(
	request: RequestWithId,
	response: Response,
	next: NextFunction,
): void {
	const inboundRequestId = request.header(requestIdHeader);
	const requestId = isValidRequestId(inboundRequestId) ? inboundRequestId : `req_${randomUUID()}`;

	request.requestId = requestId;
	response.setHeader(requestIdHeader, requestId);
	next();
}

function isValidRequestId(value: string | undefined): value is string {
	return typeof value === 'string' && /^[A-Za-z0-9._-]{1,128}$/.test(value);
}
