import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { connectDB } from './db';
import { IoManager } from './managers/IoManager';
import { UserManager } from './managers/UserManager';
import quizRoutes from './routes/quizRoutes';

const app = express();
app.use(express.json());
app.use(cors());

// Attach REST routes
app.use('/api/quizzes', quizRoutes);

const server = http.createServer(app);

const startServer = async () => {
    await connectDB();
    
    const io = IoManager.getIo(server); 
    const userManager = new UserManager();
    
    io.on('connection', (socket) => {
      userManager.addUser(socket);
    });

    server.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
};

startServer();