import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    /** Extra fields to send back with the error, such as how long to wait. */
    public readonly details: Record<string, unknown> = {},
    public readonly headers: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const badRequest = (message: string) => new ApiError(message, 400);
export const unauthorized = (message = "Unauthorized") => new ApiError(message, 401);
export const forbidden = (message = "Forbidden") => new ApiError(message, 403);
export const notFound = (message: string) => new ApiError(message, 404);
export const conflict = (message: string) => new ApiError(message, 409);
/** 429, with the standard Retry-After header so clients and proxies know when to come back. */
export const tooManyRequests = (message: string, retryAfterSeconds: number, details: Record<string, unknown> = {}) =>
  new ApiError(message, 429, { ...details, retryAfterSeconds }, { "Retry-After": String(Math.max(1, Math.ceil(retryAfterSeconds))) });

export const json = <T>(body: T, init?: ResponseInit) => NextResponse.json(body, init);

type RouteHandler<TArgs extends unknown[]> = (...args: TArgs) => Promise<NextResponse>;

/** Converts known domain errors to consistent API responses at the HTTP boundary. */
export function withApiErrorHandling<TArgs extends unknown[]>(handler: RouteHandler<TArgs>): RouteHandler<TArgs> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return json({ error: error.message, ...error.details }, { status: error.status, headers: error.headers });
      }

      console.error("Unhandled API error:", error);
      return json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
