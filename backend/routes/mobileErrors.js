const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'mobile-errors.log');

const appendLogs = async (logs) => {
  await fs.promises.mkdir(LOG_DIR, { recursive: true });
  const lines = logs.map((entry) => JSON.stringify(entry)).join('\n') + '\n';
  await fs.promises.appendFile(LOG_FILE, lines, 'utf8');
};

router.post('/bulk', async (req, res) => {
  try {
    const incoming = Array.isArray(req.body?.logs) ? req.body.logs : [];
    if (!incoming.length) {
      return res.status(400).json({ message: 'No logs provided' });
    }

    const logs = incoming.slice(0, 100).map((item) => ({
      receivedAt: new Date().toISOString(),
      id: typeof item?.id === 'string' ? item.id : undefined,
      timestamp: typeof item?.timestamp === 'string' ? item.timestamp : undefined,
      level: typeof item?.level === 'string' ? item.level : 'error',
      source: typeof item?.source === 'string' ? item.source : 'mobile-app',
      isFatal: !!item?.isFatal,
      message: typeof item?.message === 'string' ? item.message.slice(0, 5000) : 'Unknown error',
      name: typeof item?.name === 'string' ? item.name.slice(0, 200) : 'Error',
      stack: typeof item?.stack === 'string' ? item.stack.slice(0, 20000) : null,
      extra: item?.extra || null,
      context: item?.context || null,
    }));

    await appendLogs(logs);

    const fatalCount = logs.filter((l) => l.isFatal).length;
    if (fatalCount > 0) {
      console.error(`Received ${fatalCount} fatal mobile errors`);
    }

    return res.status(201).json({
      message: 'Mobile error logs stored',
      stored: logs.length,
      fatalCount,
    });
  } catch (error) {
    console.error('Failed to store mobile error logs:', error);
    return res.status(500).json({ message: 'Failed to store logs' });
  }
});

module.exports = router;
