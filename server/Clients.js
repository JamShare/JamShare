class Clients {
  constructor() {
    this.clientsMap = new Map();
    this.clients = [];
    this.maxlength = 4;
  }

  addClient(socketClientID, username) {
    if (this.maxlength <= this.clients.length) {
      throw 'Room is full.';
    }
    let priv;
    if (this.clients.length == 0) {
      priv = true;
    } else {
      priv = false;
    }
    var client = new Client(socketClientID, username, priv);
    console.log("client added to clients",client);
    // initialize more client information if needed
    // create another map using other information?
    this.clients.push(client);
    this.clientsMap.set(socketClientID, client);
  }

  removeClient(socketClientID) {
    let removedClient = this.clientsMap.get(socketClientID);
    let index = this.clients.indexOf(removedClient);
    this.clients.splice(index, 1);
    this.clientsMap.delete(socketClientID);
    return removedClient;
  }

  findClientByID(socketClientID) {
    return this.clientsMap.get(socketClientID);
  }

  findClientByIndex(index) {
    if (index >= this.maxlength - 1 || index < 0) {
      return null;
    }
    return this.clients[index];
  }

  getUsernames() {
    let usernames = [];
    if (!this.clients) {
      console.log('why is the list empty?');
      return;
    }
    console.log(this.clients);
    for (let i = 0; i < this.clients.length; i++) {
      usernames.push(this.clients[i].getUsername());
    }
    return usernames;
  }

  // returns the socketID of the next player in the game
  getNextPlayer(socketID) {
    let client = clientsMap(socketID);
    this.clients.indexOf(client);
    return this.clients[index + 1].getSocketID;
  }

  // basic array swap funct
  swap(index1, index2) {
    let hold = this.clients[index2];
    this.clients[index2] = this.clients[index1];
    this.clients[index1] = hold;
  }

  updateUsernames(userList) {
    console.log('Clients updateUsernames', this.clients ,userList);
    if (userList) {
      
      // this.clients.sort(function(a,b){
      //   if(userList.indexOf(a) != this.clients.indexOf(this.clients[a]).username){
      //     return -1;//sorts b before a in calling array. 
      //   }
      //   if(userList.indexOf(b) > this.clients.indexOf(this.clients[b]).username){
      //     return 1;
      //   }
      //   return 0; //order remains same
      // });
      // this.clients.groupBy((element,index)=>{userlist[index]});
      // for (var i = 0; i < userList.length; i++) {
      
      for (var i = 0; i < this.clients.length; i++) {//loop server array
        console.log("comparing",this.clients[i].username,":",userList[i]);

        if(this.clients[i].getUsername() != userList[i]){//if it doesnt match val at same index
          console.log("to be swapped",this.clients[i].username,":",userList[i]);
          //loop second array until it does and insert new order, removing old one.

          for (var j = 0; j < userList.length; j++) {
            console.log("seeking index to swap",i,j,this.clients[i].username,":",userList[j]);
            
            if (this.clients[i].getUsername() == userList[j]) {
              
              console.log("Swapping",  this.clients[i].username,i, "with",  this.clients[j].username,j );
              // this.swap(i, j);
              let a = this.clients[i];
              let b = this.clients[j];

              this.clients.splice(i, 1, b);
              
              this.clients.splice(j, 1, a);

              // break;
            }
          }
          // break;
        }
      }

      let newclientlist=[];
      for(var i = 0; i < this.clients.length;i++){
        newclientlist.push(this.clients[i].getUsername());
      }
      return newclientlist;
      //this.clients = userList;
    // } else {
    //   console.log('why is the list empty?');
    }
  }
}

class Client {
  constructor(socketID, username, priv) {
    this.socketID = socketID;
    this.username = username;
    this.priv = priv;
  }

  getSocketID() {
    return this.socketID;
  }

  getUsername() {
    return this.username;
  }

  setPriv(priv) {
    this.priv = priv;
  }
}

module.exports = Clients;
