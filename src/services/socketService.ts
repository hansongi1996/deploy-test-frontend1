// src/services/socketService.ts
import {
  Client,
  type IMessage,
  type StompSubscription,
  type IStompSocket,
} from '@stomp/stompjs';
// <- dist 경로 쓰지 말고 패키지 루트로!
import SockJS from 'sockjs-client';

type JSONLike = string | object;

class SocketService {
  private client: Client;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;

  constructor(
    baseUrl: string = 'http://localhost:8080',
    endpoint: string = '/stomp'
  ) {
    this.readyPromise = new Promise<void>((res) => (this.resolveReady = res));

    this.client = new Client({
      // any 금지: IStompSocket으로 캐스팅
      webSocketFactory: (): IStompSocket =>
        new SockJS(`${baseUrl}${endpoint}`) as unknown as IStompSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => console.log(`[STOMP] ${msg}`),
    });

    this.client.onConnect = () => {
      console.log('[STOMP] CONNECTED');
      this.resolveReady();
    };

    this.client.onWebSocketClose = (evt) => {
      console.warn('[STOMP] WEBSOCKET CLOSED', evt);
      // reset the ready promise so next connect waits again
      this.readyPromise = new Promise<void>((res) => (this.resolveReady = res));
    };

    this.client.onStompError = (frame) => {
      console.error('[STOMP] BROKER ERROR:', frame.headers['message'], frame.body);
    };

    // Do not auto-activate here to avoid double connect/subscribe races
    // this.client.activate();
  }

  public async connect(onConnect?: () => void): Promise<void> {
    if (!this.client.active) {
      this.client.activate();
    }
    await this.readyPromise;
    onConnect?.();
  }

  private async waitUntilReady(): Promise<void> {
    if (!this.client.active) {
      this.client.activate();
    }
    await this.readyPromise;
  }

  public disconnect(): void {
    if (this.client.active) {
      this.client.deactivate();
    }
  }

  public get connected(): boolean {
    return this.client.connected;
  }

  public async subscribe(
    destination: string,
    callback: (message: IMessage) => void
  ): Promise<StompSubscription> {
    await this.waitUntilReady();
    return this.client.subscribe(destination, callback);
  }

  public async publish(destination: string, body: JSONLike): Promise<void> {
    await this.waitUntilReady();
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    this.client.publish({ destination, body: payload, headers: { 'content-type': 'application/json' } });
  }
}

const socketService = new SocketService();
export default socketService;
