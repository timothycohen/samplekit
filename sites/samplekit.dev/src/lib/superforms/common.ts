import type { SuperForm, Schema, SuperValidated as SV, Infer } from 'sveltekit-superforms/client';

export type { SuperForm, Schema };
export type SuperValidated<S extends Schema> = SV<Infer<S>>;
