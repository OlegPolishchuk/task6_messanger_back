import {Socket} from "socket.io";
import User from "../models/User";
import {io} from "../index";

interface Message {
  from: string;
  message?: string | undefined;
  date?: Date | undefined;
  subject?: string | undefined;
}

export const socketController =  async (socket: Socket) => {
  let userName = '';
  let socketId = socket.id;

  socket.on('disconnect', async () => {
    console.log(`user ${userName} disconnected`)

    await User.updateOne({username: userName}, {$set: {status: 'offline'}})
  })

  socket.on('connected', async ({username}) => {
    console.log(`user ${username} connected`)
    userName = username;

    const usersList = [];
    for (let [id, socket] of io.of('/').sockets) {
      usersList.push({
        userId: id,
        username: socket.data.username,
      })
    }
    const user = await User.findOne({username});

    if (user) {

      const startMessages = user.messages;

      socket.broadcast.emit('new-user', usersList);
      socket.emit('load-start-data', {startMessages, usersList, socketId});

      user.status = 'online';
      await user.save();
    }
  })

  socket.on('message', async (messageFromUser) => {
    const {recipient, subject, message} = messageFromUser;
    const {userId, username} = recipient;
    const user = await User.findOne({username});

    if (!user) {
      socket.emit('error', {message: 'User doesn\'t exist'})
    }
    else {
      const newMessage = {
        from: userName,
        subject,
        message,
        date: new Date(),
        isRead: false,
      }

      user.messages.push(newMessage);
      await user.save();

      const messageToClient = user.messages[user.messages.length-1]

      socket.to(userId).emit('refresh-messages', messageToClient)
    }
  })
}