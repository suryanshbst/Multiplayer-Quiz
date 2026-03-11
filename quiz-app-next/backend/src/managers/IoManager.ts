import { Server } from "socket.io";
import http from 'http';

export class IoManager {
    private static io: Server;

    public static getIo(server?: http.Server) {
        if (!this.io) {
            if (!server) throw new Error("Server must be provided for initial setup");
            const io = new Server(server, {
                cors: {
                    origin: "*",
                    methods: ["GET", "POST"]
                }
            });
            this.io = io;
        }
        return this.io;
    }
}