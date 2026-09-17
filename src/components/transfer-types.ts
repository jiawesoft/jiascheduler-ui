/** Shared shape of one upload or download task shown in the transfer list. */
export interface TransferTask {
  id: string;
  name: string;
  direction: 'upload' | 'download';
  loaded: number;
  total?: number;
  percent: number;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
}

/**
 * How many transfers may run at the same time.
 *
 * Every chunk request opens/reuses one SSH session on the agent, and the agent
 * keeps at most 32 sessions, so this cap is what protects the agent. Raise it
 * only after checking the agent session limit.
 */
export const MAX_CONCURRENT_TRANSFERS = 3;

let seq = 0;

export function nextTransferId() {
  seq += 1;
  return `t-${Date.now().toString(36)}-${seq}`;
}
