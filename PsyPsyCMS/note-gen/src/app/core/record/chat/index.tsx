'use client'
import { ChatHeader } from './chat-header'
import { ChatInput } from "./chat-input";
import ChatContent from "./chat-content";
import { ClipboardListener } from "./clipboard-listener";

export default function Chat() {
  return <div className="flex-col flex-1 flex relative overflow-x-hidden items-center h-screen overflow-hidden dark:bg-zinc-950">
    <ChatHeader />
    <ChatContent />
    <ClipboardListener />
    <ChatInput />
  </div>
}
