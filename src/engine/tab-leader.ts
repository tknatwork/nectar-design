/**
 * Tab Leader Election — ensures only one browser tab computes the circadian theme.
 *
 * Uses BroadcastChannel API to elect a leader tab:
 * - First tab = leader (computes 49 vars every minute, broadcasts)
 * - Other tabs = followers (listen and apply, no computation)
 * - When leader closes, next tab promotes automatically
 *
 * Fallback: if BroadcastChannel unavailable (older Safari), each tab
 * computes independently — the 3-minute drift is imperceptible.
 */

import type { CircadianVarMap } from './types';

const CHANNEL_NAME = 'nectar-circadian';
const HEARTBEAT_INTERVAL = 5_000;
const LEADER_TIMEOUT = 10_000;

type MessageType =
  | { type: 'heartbeat'; tabId: string }
  | { type: 'vars'; tabId: string; vars: CircadianVarMap }
  | { type: 'claim'; tabId: string }
  | { type: 'yield'; tabId: string };

export interface TabLeaderCallbacks {
  /** Called when this tab becomes leader — start computing */
  onBecomeLeader: () => void;
  /** Called when this tab loses leadership — stop computing */
  onBecomeFollower: () => void;
  /** Called when a leader broadcasts new vars — apply them */
  onReceiveVars: (vars: CircadianVarMap) => void;
}

export class TabLeader {
  private channel: BroadcastChannel | null = null;
  private tabId: string;
  private isLeader = false;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private leaderTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastLeaderHeartbeat = 0;
  private callbacks: TabLeaderCallbacks;
  private disposed = false;

  constructor(callbacks: TabLeaderCallbacks) {
    this.tabId = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.callbacks = callbacks;
  }

  /** Start leader election. Call once on mount. */
  start(): void {
    if (typeof BroadcastChannel === 'undefined') {
      // Fallback: always be leader (each tab independent)
      this.isLeader = true;
      this.callbacks.onBecomeLeader();
      return;
    }

    try {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent<MessageType>) => {
        this.handleMessage(event.data);
      };

      // Claim leadership — if no one contests within timeout, we're leader
      this.send({ type: 'claim', tabId: this.tabId });
      this.leaderTimeout = setTimeout(() => {
        if (!this.disposed && !this.isLeader) {
          this.promoteToLeader();
        }
      }, 2000);
    } catch {
      // BroadcastChannel failed — fall back to independent
      this.isLeader = true;
      this.callbacks.onBecomeLeader();
    }
  }

  /** Broadcast computed vars to follower tabs. Call from leader only. */
  broadcastVars(vars: CircadianVarMap): void {
    if (!this.isLeader || !this.channel) return;
    this.send({ type: 'vars', tabId: this.tabId, vars });
  }

  /** Clean up. Call on unmount. */
  dispose(): void {
    this.disposed = true;

    if (this.isLeader && this.channel) {
      this.send({ type: 'yield', tabId: this.tabId });
    }

    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.leaderTimeout) clearTimeout(this.leaderTimeout);
    this.channel?.close();
    this.channel = null;
  }

  get isCurrentLeader(): boolean {
    return this.isLeader;
  }

  // ── Internal ─────────────────────────────────────────────────

  private handleMessage(msg: MessageType): void {
    if (this.disposed) return;

    switch (msg.type) {
      case 'heartbeat':
        if (msg.tabId !== this.tabId) {
          this.lastLeaderHeartbeat = Date.now();
          // Another tab is leader — cancel our claim
          if (this.leaderTimeout) {
            clearTimeout(this.leaderTimeout);
            this.leaderTimeout = null;
          }
          if (!this.isLeader) return;
          // If we were leader but another claims, yield (shouldn't happen)
        }
        break;

      case 'vars':
        if (msg.tabId !== this.tabId && !this.isLeader) {
          this.lastLeaderHeartbeat = Date.now();
          this.callbacks.onReceiveVars(msg.vars);
        }
        break;

      case 'claim':
        if (msg.tabId !== this.tabId && this.isLeader) {
          // We're leader — send heartbeat to prevent takeover
          this.send({ type: 'heartbeat', tabId: this.tabId });
        }
        break;

      case 'yield':
        if (msg.tabId !== this.tabId) {
          // Leader yielded — try to claim
          this.lastLeaderHeartbeat = 0;
          this.leaderTimeout = setTimeout(() => {
            if (!this.disposed && !this.isLeader) {
              this.promoteToLeader();
            }
          }, Math.random() * 1000); // Jitter to avoid collision
        }
        break;
    }
  }

  private promoteToLeader(): void {
    this.isLeader = true;

    // Start heartbeat
    this.heartbeatTimer = setInterval(() => {
      if (this.isLeader && this.channel) {
        this.send({ type: 'heartbeat', tabId: this.tabId });
      }
    }, HEARTBEAT_INTERVAL);

    this.callbacks.onBecomeLeader();
  }

  private send(msg: MessageType): void {
    try {
      this.channel?.postMessage(msg);
    } catch {
      // Channel closed or errored — ignore
    }
  }
}
