import fs from 'fs';
import { join } from 'path';

let rootPath = new URL(import.meta.url).pathname;

const maxDepth = 20;

for (let i = 0; i < maxDepth; i++) {
	if (fs.existsSync(join(rootPath, 'package.json'))) {
		break;
	}
	rootPath = join(rootPath, '..');
}

/**
 * Joins from the website root directory.
 * Use to reference non-bundled code.
 */
export const joinRoot = (...path: string[]) => join(rootPath, ...path);
