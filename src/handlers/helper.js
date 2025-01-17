import { CLIENT_VERSION } from "../constants.js";
import { getGameAssets } from "../init/assets.js";
import { createStage, getStage, setStage } from "../models/stage.model.js";
import { getUser, removeUser } from "../models/user.model.js"
import handlerMappings from "./handlerMapping.js";

export const handleDisconnect = (socket, uuid) => {
    removeUser(socket.id);
    console.log(`User disconnected: ${socket.id}`);
    console.log('Current Users: ' + getUser());
}

export const handleConnection = (socket, uuid) => {
    console.log(`New User Connect: ${uuid} with socket ID: ${socket.id}`);
    console.log('Current users: ', getUser());

    createStage(uuid);

    socket.emit('connection: ', { uuid });
};

export const handlerEvent = (io, socket, data) => {
    if (!CLIENT_VERSION.includes(data.clientVersion)) {
        socket.emit('response', { status: 'fail', message: "Client Version missmatch" });
        return;
    }

    const handler = handlerMappings[data.handlerId];
    if (!handler) {
        socket.emit('response', { status: 'fail', message: 'Handler not found' })
        return;
    }

    const response = handler(data.userId, data.payload);

    if (response.broadcast) {
        io.emit('response', {
            status: 'success',
            type: 'highscore_update',
            highScore: response.highScore
        });
    }

    socket.emit('response', response);

}
