# Chat UI (Option B)

## Session storage
- Session IDs live in `localStorage` under the key `chat_session_id`.
- `useChatSessionId()` reuses any existing ID from localStorage; otherwise it lets the backend issue one on first message.
- "Clear chat" removes the stored session ID and resets the UI state.

## Streaming parsing
- `POST /api/ai/chat/stream` is called with `Accept: text/event-stream`.
- Request body includes `{ message, session_id? }`.
- The stream is read via `ReadableStream.getReader()` and decoded with `TextDecoder`.
- Chunks are buffered, split on `\n\n`, and each event is parsed by `event:` + `data:` lines.
- `delta` events append text to the assistant draft; `final` replaces it; `error` displays a banner.
- If streaming fails, the UI falls back to `POST /api/ai/chat` and renders `answer`.

## Local testing
1) Start the frontend: `npm run dev`
2) Ensure the backend is running and reachable at `NEXT_PUBLIC_API_URL` (or `/api` if you proxy it)
3) Open a protected page and click the floating **Chat** button
4) Send a message and verify the streaming output and "Stop" / "Clear chat" behavior
