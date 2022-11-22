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
  console.log(socketId)

  socket.on('disconnect', async () => {

  })

  socket.on('connected', async ({username}) => {
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
    }

  })

  socket.on('message', async (messageFromUser) => {
    const {recipient, subject, message} = messageFromUser;
    const {userId, username} = recipient;
    console.log(`recip`, recipient)
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
      }

      user.messages.push(newMessage);
      await user.save();

      const messageToClient = user.messages[user.messages.length-1]

      console.log('сработал on-message on server')
      console.log(`recipient`, recipient)

      socket.to(userId).emit('refresh-messages', messageToClient)
    }
  })


}