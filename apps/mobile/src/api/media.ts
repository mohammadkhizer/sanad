export interface MediaSession {
  isMuted: boolean;
  isVideoEnabled: boolean;
  isFrontCamera: boolean;
  toggleMute(): void;
  toggleVideo(): void;
  flipCamera(): void;
}

export class MockMediaSession implements MediaSession {
  isMuted = false;
  isVideoEnabled = true;
  isFrontCamera = true;

  toggleMute() {
    this.isMuted = !this.isMuted;
  }

  toggleVideo() {
    this.isVideoEnabled = !this.isVideoEnabled;
  }

  flipCamera() {
    this.isFrontCamera = !this.isFrontCamera;
  }
}

export const createMediaSession = (): MediaSession => new MockMediaSession();

