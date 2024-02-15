import { Writable } from 'stream';
import pg from 'pg';
import build from 'pino-abstract-transport';

export type PinoPgOpts = { table: string; column: string; connectionString: string };

export default async function pinoTransport(opts: PinoPgOpts) {
	if (!opts)
		throw new Error(`@samplekit/pino-pg usage:
{
	level: 'debug',
	options: { table: 'logs_debug', column: 'log', connectionString: PG_CONNECTION_STRING } satisfies Opts,
	target: createRequire(import.meta.url).resolve('@samplekit/pino-pg'),
}`);
	const { column, table, connectionString } = opts;

	const db = new pg.Client({ connectionString });
	await db.connect();

	const stream = new Writable({
		objectMode: true,
		autoDestroy: true,
		write(chunk, _, cb) {
			db.query(`INSERT INTO ${table}(${column}) VALUES($1)`, [chunk], cb);
		},
		async destroy(err, cb) {
			await db.end();
			return cb(err);
		},
	});

	return build(
		function (source) {
			source.pipe(stream);
		},
		{
			close(err, cb) {
				stream.end();
				stream.once('close', cb.bind(null, err));
			},
		},
	);
}
