const {Pool} = require("pg");
const {creds} = require("./creds.js")

class db {
    constructor(){
        this.pool = new Pool(creds)
    }
    get_db = () => this.pool;
    disconnect = () => pool.end();
    execute = (command, values) => 
        this.pool.query(command, values)
}

const pg = new db();

module.exports = {
    pg
}