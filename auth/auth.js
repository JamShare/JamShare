const {pg} = require("./db_connect.js")

/**
 * 
CREATE TABLE people (\
    id serial primary key,\
    username TEXT not null,\
    password TEXT not null\
);
 */

const register_new_user = async (username, password) => {
    console.log(username, password)
    try{
        await pg.execute("insert into people (username,password) values ($1,$2)", 
        [username, password])
    }
    catch(err){
        console.log("Failed to add new username")
        return false;
    }

    console.log("Adding new username")
    return true;
}

const validate_creds = async (username, password) => {
    const res = await pg.execute("select * from people where username = $1", 
    [username]);

    const rows = res.rows[0];

    return rows?.password ? rows.password === password : 400;
}

const remove_user = async (username) => {
    const res = await pg.execute("delete from people where username = $1", 
    [username])

    if(res) return 200;
    return 400; 
}

const test = async () => {
    //const r = await validate_password("a", "b");
    //const r = await register_new_user("morg", "b");
    //const r = await validate_password("a", "b");
}
test()

module.exports = {
    register_new_user, 
    validate_creds,
    remove_user
}