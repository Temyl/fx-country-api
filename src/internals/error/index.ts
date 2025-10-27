export class ApplicationError extends Error {
  constructor(
    readonly code: number,
    message: string,
    readonly data?: any,
  ) {
    super(message);
  }
}
