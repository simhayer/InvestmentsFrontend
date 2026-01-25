"use client";

import * as React from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";

type ChatLauncherProps = {
  className?: string;
};

export function ChatLauncher({ className }: ChatLauncherProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <ChatPanel
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      className={className}
    />
  );
}
