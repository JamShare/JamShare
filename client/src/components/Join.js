import React, { useEffect, useState, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
// import FormLabel from "react-bootstrap/esm/FormLabel";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
// import { Socket } from 'socket.io-client';
import Modal from 'react-bootstrap/Modal';
import JamShareLogo from "./assets/images/JamShareLogo.jpg";
import JoinModal from './JoinModal';
import socket from "../index";

// import {Morg_Signup} from "./component_export"

//const SERVER = 'http://localhost:3001';
const SERVER = "https://berryhousehold.ddns.net:3001";

// Join or create a Jam session room with link ID
function Join(props) {

  const [sessionID, setSessionID] = useState("");
  const [showModal, setModal] = useState(false);
  const handleClose = () => setModal(false);
  const handleShow = () => setModal(true);
  const [copied, setCopied] = useState(false);
//   const [joinSuccess, setJoinSuccess] = useState(false);
  const inputArea = useRef(null);
  const navigate = useNavigate();
  //state passed in from Signup.js
  const guest = useLocation().state.usn;

  console.log("join username: ", guest);

  socket.on("create-session-response", session_ID => {
    console.log("create session response from server", session_ID);
    setSessionID(session_ID);//doesnt seem to actually work
    // console.log(sessionID);//should have session_ID value in state sessionID but doesnt because its async
    handleShow();
  }); 
  useEffect(() => {
    console.log("session ID updated:",sessionID);
    // setSessionID(sessionID)
  },[sessionID]);

  useEffect(() => {
    socket.on('join-session-success', usernames =>{
      console.log("joining session with users:",usernames);
      let path = '/Room';
      navigate(path, {state:{sessionID, guest, usernames}});
    });
  },[sessionID]);

  socket.on('join-session-failed', ()=>{
    alert(`Session ID: ${sessionID} does not exist.`)
  });


  // }, [])

  const createSession = (room) => {
    room.preventDefault();
    socket.emit("create-session", guest);
  }

  const joinSession = (e) => {
    e.preventDefault();
    // console.log(e.target.value);
    console.log(sessionID)
    let data = {sessionID:sessionID, username:guest};
    socket.emit('join-session', data);
  }

  function updateClipboard(newClip) {
    navigator.clipboard.writeText(newClip).then(
      () => {
        setCopied("Copied!");
      },
      () => {
        setCopied("Copy failed!");
      }
      );
    }
    
  function copyLink() {
    navigator.permissions
      .query({ name: "clipboard-write" })
      .then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
          updateClipboard(inputArea.current?.innerText);
        }
      });
    }

    return (
        <>
        <Modal {...props} aria-labelledby="contained-modal-title-vcenter" 
        show={showModal} 
        title={guest} 
        data={sessionID} 
        onHide={handleClose}
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
              {guest}, Share this link with your fellow Jammers!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="show-grid">
          <Container>
            <Row>
              <Col lg={4}></Col>
                <Col lg={4} id="a" ref={inputArea} >
                  {sessionID}
                </Col>
              <Col lg={4}></Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={copyLink}>Copy to Clipboard</Button>
            <Button onClick={joinSession} >Join Session</Button>
            <Button onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
        <div id="container"  className={'bgcolor'} >
            <div class="banner">
                <img class="jamshare-logo" src={JamShareLogo} alt="logo" />
            </div>
            <br></br>
            <br></br>
            <h1 className={'gentext orange'}>Let's get Jammin'</h1>
            <div className='joinbox'>
                <Row>    
                    <Col></Col>
                    <Col> 
                        <h2>Join Existing Jam Session</h2>
                        <div className='orange-session-id'>
                            <br></br>
                            <br></br>
                            <h2>Enter ID:</h2>
                            <form onSubmit={joinSession} >
                                <input type="text" name="session" onChange={e => setSessionID(e.target.value)}  />
                                <input type="submit" value="Submit"/> 
                            </form>
                        </div>
                    </Col>
                    <Col></Col>
                    <Col>
                        <h2>Create New Jam Session</h2>
                        {/* <div className='purple-new-id'> */}
                            {/* <br></br> */}
                            <Button variant="flat" className='purple-new-id' flex style={{backgroundColor: "purple"}} onClick={createSession}>
                                <h2>Create New ID</h2>
                            </Button>
                        {/* </div> */}
                    </Col>
                    <Col></Col>
                </Row>
            </div>
        </div>
        </>
    );
}

export default Join;