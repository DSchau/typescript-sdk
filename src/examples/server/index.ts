import express, { Request, Response } from 'express';

import { streamableApp, streamableAppDisconnect } from './jsonResponseStreamableHttp.js';
import { simpleSseServer, simpleSseServerDisconnect } from './simpleSseServer.js';
import { statelessStreamableServer, statelessStreamableServerDisconnect, statelessStreamableServerSetup } from './simpleStatelessStreamableHttp.js';
import { simpleStreamableHttp, simpleStreamableHttpDisconnect } from './simpleStreamableHttp.js';
import { sseAndStreamableHttp, sseAndStreamableHttpDisconnect } from './sseAndStreamableHttpCompatibleServer.js';
import { standaloneSseWithGetStreamable, standaloneSseWithGetStreamableDisconnect } from './standaloneSseWithGetStreamableHttp.js';

const setupArr = [statelessStreamableServerSetup]
const disconnectArr = [streamableAppDisconnect, simpleSseServerDisconnect, statelessStreamableServerDisconnect, simpleStreamableHttpDisconnect, sseAndStreamableHttpDisconnect, standaloneSseWithGetStreamableDisconnect]

const app = express()

app.use('/', sseAndStreamableHttp)
app.use('/streamable-http', streamableApp)
app.use('/streamable-http/simple', simpleStreamableHttp)
app.use('/sse/simple', simpleSseServer)
app.use('/sse/stateless', statelessStreamableServer)
app.use('/sse/standalone', standaloneSseWithGetStreamable)

for (let handler of setupArr) {
  await handler()
}

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`MCP Streamable HTTP Server listening on port ${PORT}`);
});

// Handle server shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  try {
    for (let handler of disconnectArr) {
      await handler()
    }
    process.exit(0);
  } catch (e) {
    console.error(e)
  }
});
