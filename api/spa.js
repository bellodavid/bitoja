import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function handler(req, res) {
  if (req.url === '/health') {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      buildTime: new Date().toISOString()
    });
  } else {
    // Serve the SPA for all other routes
    try {
      const indexPath = join(__dirname, '../dist/public/index.html');
      const html = readFileSync(indexPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } catch (error) {
      res.status(404).json({ error: 'Not found', path: req.url });
    }
  }
}
