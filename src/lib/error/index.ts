interface AppErrorConstructor {
  title: string;
  description?: string;
  statusCode?: number;
}

export class AppError {
  public readonly title: string;
  public readonly description: string | undefined;

  public readonly statusCode: number;

  constructor({ title, description, statusCode = 400 }: AppErrorConstructor) {
    this.title = title;
    this.description = description;
    this.statusCode = statusCode;
  }
}
