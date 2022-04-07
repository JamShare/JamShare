const socket = require('socket.io');
const socketStream = require('socket.io-stream');

class Streams {
    
  constructor(){
  
    }

    streamToClientsInRoom = (stream, data) => {
    // print("hello");
    // ss.on('client-stream'), function(stream, data){
      pathDownloadingFile = path.basename(data.name);
      stream.pipe((pathDownloadingFile));
    // };
  };

}