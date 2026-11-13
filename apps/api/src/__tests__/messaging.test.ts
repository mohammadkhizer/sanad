import { describe, it, expect, vi } from 'vitest';
import { messagingController } from '../modules/messaging/messaging.controller.js';
import { ConversationModel, MessageModel, ChatRequestModel } from '../modules/messaging/messaging.model.js';
import { UserModel } from '../modules/auth/auth.model.js';
import { BlockModel } from '../modules/users/users.model.js';
import mongoose from 'mongoose';

describe('Messaging & Chat Direct Communication Suite', () => {
  it('validates empty message body rejection', async () => {
    const fakeReq: any = {
      params: { id: new mongoose.Types.ObjectId().toString() },
      user: { id: new mongoose.Types.ObjectId().toString(), roles: ['member'] },
      body: { body: '   ' },
    };
    const fakeRes: any = {};
    const fakeNext = vi.fn();

    await messagingController.sendMessage(fakeReq, fakeRes, fakeNext);
    expect(fakeNext).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Message body is required',
    }));
  });

  it('rejects invalid identifier format for conversations and messages', async () => {
    const fakeReq: any = {
      params: { id: 'invalid-object-id' },
      user: { id: new mongoose.Types.ObjectId().toString(), roles: ['member'] },
    };
    const fakeRes: any = {};
    const fakeNext = vi.fn();

    await messagingController.getMessages(fakeReq, fakeRes, fakeNext);
    expect(fakeNext).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid identifier',
    }));
  });

  it('rejects self-targeted chat requests', async () => {
    const myId = new mongoose.Types.ObjectId();
    const fakeReq: any = {
      user: { id: myId.toString(), roles: ['member'] },
      body: { scholarId: myId.toString(), message: 'Hello self' },
    };
    const fakeRes: any = {};
    const fakeNext = vi.fn();

    await messagingController.sendChatRequest(fakeReq, fakeRes, fakeNext);
    expect(fakeNext).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Cannot send chat request to yourself',
    }));
  });
});
