import { Server, Socket as SocketIO } from "socket.io";

class Socket {

    private io: Server | null = null;

    constructor(io?: Server | null) {
        if (io) this.io = io;

        this.socketEvents();
    }


    socketEvents() {
        (this.io) && this.io.on('connection', (socket: SocketIO) => {
            console.log('Cliente conectado');

            //escuchar evento del cliente
            socket.on('mensaje-to-server', (data: any) => {
                console.log(data);

                //enviar mensaje a todo los clientes
                (this.io) && this.io.emit('mensaje-from-server', data)
            })
        })
    }
}

export default Socket