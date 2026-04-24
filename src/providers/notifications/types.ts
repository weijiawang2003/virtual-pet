export interface NotificationRequest {
  readonly title: string;
  readonly body: string;
  readonly fireAt: number;
  readonly data?: Readonly<Record<string, unknown>>;
}

export interface ScheduledNotification extends NotificationRequest {
  readonly id: string;
}

export interface NotificationProvider {
  schedule(req: NotificationRequest): Promise<string>;
  cancel(id: string): Promise<void>;
  cancelAll(): Promise<void>;
  listAll(): Promise<readonly ScheduledNotification[]>;
}
