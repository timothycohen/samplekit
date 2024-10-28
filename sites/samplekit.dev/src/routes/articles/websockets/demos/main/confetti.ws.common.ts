export const confettiEventName = 'confetti';

export type ConfettiClientEvent = { [confettiEventName]: () => void };

export type ConfettiServerMsg = { confetti: string };
export type ConfettiServerEvent = { [confettiEventName]: () => void };
