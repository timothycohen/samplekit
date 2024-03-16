import * as path from 'path';
import * as url from 'url';
import { createWebSocketServer, onHttpServerUpgrade } from './ws/utils.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

createWebSocketServer();

const { server } = await import(path.resolve(__dirname, '../build/index.js'));
server.server.on('upgrade', onHttpServerUpgrade);
