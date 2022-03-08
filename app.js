//Express Reqs
var express = require('express');
const bodyParser = require('body-parser')
var cors = require('cors');

//Reqs
const http = require("http");
const socket = require("socket.io");

const port = process.env.PORT || 3001;


var app = express();

app.use(bodyParser.json());
app.use(cors())


app.post('/sample_request', async (req, res) => {
	console.log(req.body)
	res.send({
		important_information: "better pizza", 
		more_important_info: "better ingredients",
		test: req.body.test + "5678"
	})
});


//Server
const server = http.createServer(app);
const io = socket(server);

// Listening for incoming connections

io.on("connection", (socket) => {
	console.log(socket.id);
    socket.on('SEND_MESSAGE', function(data){
        io.emit('RECEIVE_MESSAGE', data);
    })
});

server.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;
