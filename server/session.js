const joinSession = ({clientID,  sessionID}) => {
    try{
        if(sessions[sessionID] === undefined){
            socket.emit("error", { error: "invalid SID"});
            return;
        }

    } catch (error) {
        console.error(error);
    }
};