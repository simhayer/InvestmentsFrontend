export type ConnectionStatus =
  | "connected"
  | "syncing"
  | "error"
  | "disconnected";

export type Connection = {
  id: string;
  institutionName: string;
  syncedAt?: string | Date | null;
  createdAt?: string | Date | null;
  status: ConnectionStatus;
};
