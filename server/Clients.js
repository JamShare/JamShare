class Clients {
  constructor() {
    this.clientsMap = new Map();
    this.clients = [];
    this.maxlength = 4;
  }

  // retclientsmap(){
  //   return this.clientsMap;
  // }

  // retclients(){
  //   return this.clients;
  // }

  addClient(socketClientID, username)  {
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
    console.log(client);
    // initialize more client information if needed
    // create another map using other information?
    this.clients.push(client);
    this.clientsMap.set(socketClientID, client);
  }

  removeClient(socketClientID) {
    let client = clientsMap(socketClientID);
    this.clients.indexOf(client);
    this.clients.splice(index, 1);
    this.clientsMap.delete(socketClientID);
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
    console.log('Clients updateUsernames');
    if (userList) {
      for (var i = 0; i < userList.length; i++) {
        for (var j = i; j < userList.length; j++) {
          if (this.clients[i].username == userList[j]) {
            console.log('this.clients[i].username ' + this.clients[i].username);
            console.log('userList[j] ' + userList[j]);
            this.swap(i, j);
          }
        }
      }
      //this.clients = userList;
    } else {
      console.log('why is the list empty?');
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
