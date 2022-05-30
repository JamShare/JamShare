class Clients {

    constructor(socketID, username){
    // this.clients = [];
      this.id = socketID;
      this.username = username
    }

    // addClient(socketclientID, credentials){
      
    // };

    //return client info given connected socket.id
    clientInfo(socketclientID) {
      const clientInfo = clients.find((client) => client.id === socketclientID);
      if(ret !== undefined){
        return clientInfo;
      }
      return {error:"not found"};
    };



}