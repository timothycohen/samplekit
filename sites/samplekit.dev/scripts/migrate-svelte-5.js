#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { join } from 'path';
import { migrate } from 'svelte/compiler';

const srcDir = join(new URL(import.meta.url).pathname, '..', '..', 'src');

/**
 *
 * @param {string} dirPath
 * @param {(src: string) => boolean} fileInclude
 * @returns {string[]}
 */
function readdirRecursiveSync(dirPath, fileInclude) {
	/** @type {string[]} Array of file paths */
	let files = [];
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });
	entries.forEach((entry) => {
		const fullPath = path.join(dirPath, entry.name);
		if (entry.isDirectory()) {
			files = files.concat(readdirRecursiveSync(fullPath, fileInclude));
		} else if (entry.isFile() && fileInclude(fullPath)) {
			files.push(fullPath);
		}
	});
	return files;
}

/**
 *
 * @param {string} filePath
 * @returns {Promise<{ filePath: string } & ({ error: Error; changed?: true } | { error?: never; changed: boolean })>}
 */
const tryMigrate = (filePath) => {
	return new Promise((resolve) => {
		fs.readFile(filePath, (readErr, data) => {
			if (readErr) return resolve({ filePath, error: readErr });

			const source = data.toString();
			let migratedSource = '';
			try {
				migratedSource = migrate(source).code;
			} catch (migrateErr) {
				if (migrateErr instanceof Error) return resolve({ filePath, error: migrateErr });
				else return resolve({ filePath, error: new Error(`Migration failed with unknown error`) });
			}
			if (source === migratedSource) {
				return resolve({ filePath, changed: false });
			}
			fs.writeFile(filePath, migratedSource, (writeErr) => {
				if (writeErr) {
					return resolve({ filePath, error: writeErr });
				}
				return resolve({ filePath, changed: true });
			});
		});
	});
};

const allSvelteFiles = readdirRecursiveSync(srcDir, (file) => file.endsWith('.svelte'));
const migrationResults = await Promise.all(allSvelteFiles.map(tryMigrate));

migrationResults.forEach((r) => {
	if (r.error) {
		console.error(`❌ ${r.filePath} | ${r.error.message}`);
	} else if (r.changed) {
		console.log(`✅ ${r.filePath}`);
	} else {
		console.log(`🟡 ${r.filePath}`);
	}
});
