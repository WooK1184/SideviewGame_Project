const users = [];

export const addUser = (user) => {
    users.push(user)
};

export const removeUser = () => {
    const index = users.findIdex((user) => user.socketId === socketId);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

export const getUser = (user) => {
    return users;
};