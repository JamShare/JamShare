class Clients {

    constructor(){
    this.clients = [];
    }

    clientInfo(socketclientID) {
      const clientInfo = clients.find((client) => client.id === socketclientID);
      if(ret !== undefined){
        return clientInfo;
      }
      return {error:"not found"};
  };



}