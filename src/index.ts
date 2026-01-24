import express, { Request, Response } from 'express';
import { createServer } from 'http';
import path from 'path';
import { initializeSocket } from './config/socket';

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 4000;

initializeSocket(httpServer);

app.use(express.static(path.join(__dirname, '../public')));

app.get('/api', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
