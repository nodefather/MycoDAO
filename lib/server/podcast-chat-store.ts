/**
 * File-backed chat for Pulse podcast studio (single-node / VM deploy).
 * Not for multi-instance serverless without shared storage.
 */

import fs from "fs";
import path from "path";

const MAX_MESSAGES = 400;

export type PodcastChatMessage = {
  id: string;
  text: string;
  displayName: string;
  createdAt: string;
};

function chatFilePath(): string {
  return path.join(process.cwd(), "data", "podcast-chat.json");
}

export function readPodcastChat(): PodcastChatMessage[] {
  const file = chatFilePath();
  try {
    const raw = fs.readFileSync(file, "utf8");
    const data = JSON.parse(raw) as { messages?: PodcastChatMessage[] };
    return Array.isArray(data.messages) ? data.messages : [];
  } catch {
    return [];
  }
}

export function appendPodcastChat(input: {
  text: string;
  displayName?: string;
}): PodcastChatMessage {
  const file = chatFilePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const text = input.text.trim().slice(0, 500);
  const displayName = (input.displayName || "listener").trim().slice(0, 24) || "listener";

  const row: PodcastChatMessage = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    text,
    displayName,
    createdAt: new Date().toISOString(),
  };

  const prev = readPodcastChat();
  const next = [...prev, row].slice(-MAX_MESSAGES);
  fs.writeFileSync(file, JSON.stringify({ messages: next }, null, 0), "utf8");
  return row;
}
