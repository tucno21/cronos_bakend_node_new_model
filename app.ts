import dotenv from 'dotenv';
import Server from './src/core/server';
dotenv.config();

//instanciamos la clase Server
const server = new Server();
//llamamos al método listen 
server.listen();