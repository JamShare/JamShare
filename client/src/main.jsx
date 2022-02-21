import React from "react";

//start here: https://reactjs.org/docs/introducing-jsx.html

/**
 * 
 * @param {socket Object} socket - The socket object that user used to connect to server. 
 */
export default function JamShare({ socket }) {
  return (
    <>
      <JamShare socket={socket} />
    </>
  );
}
