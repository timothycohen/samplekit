import type {
	ConfettiClientEvent,
	ConfettiServerEvent,
} from '$routes/articles/websockets/demos/main/confetti.ws.common';
import type { PizzaClientEvent, PizzaServerEvent } from '$routes/articles/websockets/demos/main/pizza.ws.common';

// ClientEvents are emitted from the client with ClientSocket.emit()
// The server handles them by registering handlers in `$lib/ws/server/events.ts handleEventsFromClient`
export type ClientEvents = PizzaClientEvent & ConfettiClientEvent;

// ServerEvents are emitted from the server with IoServer.emit()
// The client gets a reference to the ClientSocket with `useWsCtx` and listens for server messages by registering ClientSocket.on() handlers
export type ServerEvents = PizzaServerEvent & ConfettiServerEvent;
export type ClientEventName = keyof ClientEvents;
export type ServerEventName = keyof ServerEvents;
