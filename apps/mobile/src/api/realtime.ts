type EventCallback = (data: unknown) => void;

export interface RealtimeClient {
  connect(): void;
  disconnect(): void;
  on(event: string, callback: EventCallback): () => void;
  emit(event: string, data: unknown): void;
  joinRoom(room: string): void;
  leaveRoom(room: string): void;
}

class MockRealtimeClient implements RealtimeClient {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private joinedRooms: Set<string> = new Set();
  private mockInterval: NodeJS.Timeout | null = null;

  connect() {
    // Start occasional simulated live events if in a room
    if (!this.mockInterval) {
      this.mockInterval = setInterval(() => {
        if (this.joinedRooms.has('live_room')) {
          this.trigger('live:viewer_count', { count: Math.floor(400 + Math.random() * 50) });
        }
      }, 5000);
    }
  }

  disconnect() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
    this.listeners.clear();
    this.joinedRooms.clear();
  }

  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, data: unknown) {
    this.trigger(event, data);
  }

  joinRoom(room: string) {
    this.joinedRooms.add(room);
  }

  leaveRoom(room: string) {
    this.joinedRooms.delete(room);
  }

  private trigger(event: string, data: unknown) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch {
          // ignore callback error
        }
      });
    }
  }
}

export const realtime: RealtimeClient = new MockRealtimeClient();
