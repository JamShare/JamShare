//Express Reqs
var express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');
//const request = require('request');
//Reqs
const http = require('http');
const socket = require('socket.io');

const port = process.env.PORT || 3001;

var app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', function (request, response) {
  response.sendFile(__dirname + '/message.json');
});

app.post('/chat', function (request, response) {
  console.log(request.body);
  response.set('Access-Control-Allow-Origin', '*');
});
app.post('/sample_request', async (req, res) => {
  console.log(req.body);
  res.send({
    important_information: '3better pizza3',
    more_important_info: '3better ingredients3',
    test: req.body.test + '356783',
  });
});

//Server
const server = http.createServer(app);
const io = socket(server);

// Listening for incoming connections

io.on('connection', (socket) => {
  console.log('connected Id:', socket.id);
  socket.on('SEND_MESSAGE', function (data) {
    io.emit('RECEIVE_MESSAGE', data);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

app.use(express.static(path.resolve(__dirname, './client/build')));

module.exports = app;
