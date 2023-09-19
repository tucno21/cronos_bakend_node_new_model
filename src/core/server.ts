import express, { Application } from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import router from './route';

import http from 'http';
import { Server as SocketServer } from 'socket.io';
import Socket from '../socket/socket';
import { AppConfig } from './config';

class Server {

    // private app: express.Application;
    private app: Application;
    private port: string;

    private server: http.Server;
    private io: SocketServer | null;


    constructor() {
        this.app = express();
        this.port = AppConfig.PORT;

        this.server = http.createServer(this.app);

        (AppConfig.SOCKET_IO_ENABLED) ? this.io = new SocketServer(this.server) : this.io = null;
    }

    middlewares() {
        //cors
        this.app.use(cors());
        //lectura y parseo del body
        this.app.use(express.json());
        //directorio publico
        this.app.use(express.static('public'));
        // Habilitar fileUpload
        this.app.use(fileUpload());
    }

    routes() {
        //inicio de las rutas
        this.app.use(AppConfig.INIT_PATH, router);
        // Middleware para manejar rutas no encontradas
        this.app.use((_req, res) => {
            res.status(404).json({ error: 'Ruta no encontrada' });
        });
    }

    soccket() {
        (AppConfig.SOCKET_IO_ENABLED) && new Socket(this.io);
    }

    verConsolas() {
        console.log(process.env.NAME_INIT_PATH);
        // console.log(process.env.PORT);
        // console.log(process.env.DB_HOST);
        // console.log(process.env.DB_PORT);
        // console.log(process.env.DB_DATABASE);
        // console.log(process.env.DB_USERNAME);
        // console.log(process.env.DB_PASSWORD);
        // console.log(process.env.JWT_SECRET);
        // console.log(process.env.FOLDER_NAME);
        // console.log(process.env.app_env);
    }

    listen() {
        //iniciar los middlewares
        this.middlewares();
        //iniciar la ruta
        this.routes();
        //ver las variables de entorno
        this.verConsolas();
        //iniciar socket
        this.soccket();

        // this.app.listen(this.port, () => {
        //     console.log(`Servidor corriendo en el puerto ${this.port}`);
        // });
        this.server.listen(this.port, () => {
            console.log(`Servidor corriendo en el puerto ${this.port}`);
        })
    }
}

export default Server;