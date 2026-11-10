import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface VideoGrant {
  room?: string;
  roomJoin?: boolean;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
  hidden?: boolean;
  recorder?: boolean;
}

export interface LiveKitTokenClaims {
  iss: string;
  sub: string;
  name?: string;
  video: VideoGrant;
  metadata?: string;
}

export class LiveKitService {
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.apiKey = config.livekit.apiKey;
    this.apiSecret = config.livekit.apiSecret;
  }

  public generateToken(
    identity: string,
    displayName: string,
    grant: VideoGrant,
    expiresInSeconds: number = 21600 // 6 hours
  ): string {
    const payload: LiveKitTokenClaims = {
      iss: this.apiKey,
      sub: identity,
      name: displayName,
      video: grant,
    };

    return jwt.sign(payload, this.apiSecret, {
      expiresIn: expiresInSeconds,
      header: {
        alg: 'HS256',
        typ: 'JWT',
      },
    });
  }

  public createHostToken(
    userId: string,
    displayName: string,
    roomName: string
  ): { token: string; roomName: string; role: 'host' } {
    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    };

    const token = this.generateToken(userId, displayName, grant, 21600);
    return { token, roomName, role: 'host' };
  }

  public createViewerToken(
    userId: string,
    displayName: string,
    roomName: string
  ): { token: string; roomName: string; role: 'viewer' } {
    // Viewer receives strictly read-only media grants (cannot publish audio/video)
    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: false,
      canSubscribe: true,
      canPublishData: true, // Allows typing in live Q&A text chat
    };

    const token = this.generateToken(userId, displayName, grant, 7200); // 2 hours
    return { token, roomName, role: 'viewer' };
  }

  public createCallToken(
    userId: string,
    displayName: string,
    roomName: string
  ): { token: string; roomName: string; role: 'caller' | 'callee' } {
    // Both participants in 1:1 consultation can speak and publish video
    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    };

    const token = this.generateToken(userId, displayName, grant, 3600); // 1 hour
    return { token, roomName, role: 'caller' };
  }

  public decodeAndVerifyToken(token: string): LiveKitTokenClaims {
    return jwt.verify(token, this.apiSecret) as LiveKitTokenClaims;
  }
}

export const livekitService = new LiveKitService();

