
import { addUser } from "../models/user.model.js";
import { v4 as uuidv4 } from 'uuid';
import { handleConnection, handleDisconnect, handlerEvent } from './helper.js'


const registerHandler = (io) => {
    io.on('connection', (socket) => {
        //이벤트 처리

        const userUUID = uuidv4();
        addUser({ uuid: userUUID, socketId: socket.id });

        //클라이언트에게 uuid 전달
        socket.emit('connection', {uuid: userUUID})

        handleConnection(socket, userUUID);

        socket.on('event', (data) => handlerEvent(io, socket, data));
        socket.on('disconnect', (socket) => handleDisconnect(socket, userUUID));
    })
}

export default registerHandler;