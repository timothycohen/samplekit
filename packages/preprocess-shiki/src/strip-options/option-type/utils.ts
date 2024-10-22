export const escapeOptGroup = (optGroupStr: string) =>
	optGroupStr.replace(/\\\\n/g, '\n').replace(/\\\\r/g, '\r').replace(/\\\\t/g, '\t').replace(/\\\\/g, '\\');
