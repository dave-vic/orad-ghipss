// In-memory presence: folderId -> Map of userId -> { id, name, role }
const folderPresence = new Map();
const clients = new Map(); // clientId -> { res, userId, folderId }

let clientIdCounter = 0;

export const joinPresence = (req, res) => {
  const { folderId } = req.params;
  const user = req.user;
  const clientId = ++clientIdCounter;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Add to presence
  if (!folderPresence.has(folderId)) folderPresence.set(folderId, new Map());
  folderPresence.get(folderId).set(user.id, { id: user.id, name: user.name, role: user.role });
  clients.set(clientId, { res, userId: user.id, folderId });

  // Broadcast to all in folder
  broadcastPresence(folderId);

  // Send heartbeat every 30s
  const heartbeat = setInterval(() => {
    res.write('event: ping\ndata: {}\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(clientId);
    folderPresence.get(folderId)?.delete(user.id);
    if (folderPresence.get(folderId)?.size === 0) folderPresence.delete(folderId);
    else broadcastPresence(folderId);
  });
};

function broadcastPresence(folderId) {
  const users = Array.from(folderPresence.get(folderId)?.values() || []);
  const payload = `event: presence\ndata: ${JSON.stringify(users)}\n\n`;

  for (const [, client] of clients) {
    if (client.folderId === folderId) {
      client.res.write(payload);
    }
  }
}

export const getPresence = (req, res) => {
  const { folderId } = req.params;
  const users = Array.from(folderPresence.get(folderId)?.values() || []);
  res.json(users);
};
