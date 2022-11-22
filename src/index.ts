import express from 'express';
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from "body-parser";
import http from 'http';
import {Server, Socket} from 'socket.io';
import {loginRouter} from "./routes/loginRouter";
import {socketController} from "./controllers/socketController";

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {cors: {origin: '*'}});
dotenv.config();

const PORT = process.env.PORT || 5000;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

app.use(cors());
app.use(bodyParser());

app.get('/', async (req, res) => {
  res.json({message: 'hello'})
})


app.use('/login', loginRouter);

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error('invalid username'))
  }

  socket.data.username = username
  next();
})

io.on('connection', socketController)



const start = async () => {
  try{
    await mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.koqzweg.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`);

    server.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`)
    })
  } catch (e) {
    console.log(e)
  }
}

start();

