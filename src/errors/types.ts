/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ErrorConstructor {
  message: string;
  stack?: string;
  action?: string;
  statusCode?: number;
  errorId?: string;
  requestId?: string;
  context?: any;
  errorLocationCode?: string;
  key?: string;
  type?: string;
  databaseErrorCode?: string;
}

export interface AppError extends Error {
  name: string;
  message: string;
  action?: string;
  statusCode: number;
  errorId: string;
  requestId?: string;
  context?: any;
  errorLocationCode?: string;
  key?: string;
  type?: string;
  databaseErrorCode?: string;
}
