// ClientEvents are emitted from the client with ClientSocket.emit()
// The server handles them by registering handlers in `$lib/ws/server/events.ts handleEventsFromClient`
export type ClientEvents = Record<string, never>;

// ServerEvents are emitted from the server with IoServer.emit()
// The client gets a reference to the ClientSocket with `useWsCtx` and listens for server messages by registering ClientSocket.on() handlers
export type ServerEvents = Record<string, never>;
export type ClientEventName = keyof ClientEvents;
export type ServerEventName = keyof ServerEvents;
