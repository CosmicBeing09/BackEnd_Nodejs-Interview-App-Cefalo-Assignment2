const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const FileApi = require('./api/FileApi');
const RunnerManager = require('./compiler/RunnerManager');
const socketio = require('socket.io');
const cors = require('cors');
const router = require('./router');
const {addUser, getUser , getUsersInRoom, removeUser} = require('./users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let messages = [];

app.use(cors());
app.use(router);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.static('dist'));
 
// Add headers to enable CORS to support cross domain communication.
app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
 
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
 
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
 
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
 
  // Pass to next layer of middleware
  next();
});

app.get('/api/file/:lang', (req, res) => {
    const language = req.params.lang;
    console.log(language);
    console.log('dirname',__dirname);
    
    FileApi.getFile(language, (content) => {
      const file = {
        lang: language,
        code: content,
      };
      res.send(JSON.stringify(file));
    });
  });
   
  app.post('/api/run', (req, res) => {
    const file = req.body;
    console.log('dirname',__dirname);
    console.log(`file.lang: ${file.lang}`, `file.code:${file.code}`);
    RunnerManager.run(file.lang, file.code, res);
  });


io.on('connection', (socket) => {
    console.log('new connection');
    
    socket.on('join', ({name, room, role, key}, callback) => {

        const {error, user} = addUser({id: socket.id, name, room, role, key});

        if(error) return callback(error);

        //console.log(user.name,user.room,user.role);

        socket.emit('message', {user : 'system', text: `${user.name}, welcome to the room ${user.room}`, key:user.key});
        socket.emit('history',messages);
        socket.broadcast.to(user.room).emit('message', {user : 'system', text: `${user.name}, welcome to the room ${user.room}`});
        
        socket.join(user.room);

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        //console.log(user);
        
        let temp = {user : user.name, text : message};
        messages.push(temp);

        io.to(user.room).emit('message', {user: user.name, text: message});

        callback();
    });

    socket.on('code', (message, callback) => {
        const user = getUser(socket.id);
        //console.log(user);
        
        io.to(user.room).emit('code', {code: message});

        callback();
    });

    socket.on('disconnect', () => {
        console.log('User has left!!!');
        const user = removeUser(socket.id);

        if(user) {
          io.to(user.room).emit('message', { user: 'system', text: `${user.name} has left.` });
          //io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
    });
})

server.listen(5000, ()=> console.log(`server has started`));