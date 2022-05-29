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


// import {Morg_Signup} from "./component_export"


// import JoinModal from './JoinModal';
const io = require('socket.io-client');
const SERVER = "http://localhost:3001";
// Join or create a Jam session room with link ID
function Join(props) {

  const [sessionID, setSessionID] = useState("");
  const [showModal, setModal] = useState(false);
  const handleClose = () => setModal(false);
  const handleShow = () => setModal(true);
  const [copied, setCopied] = useState(false);
//   const [joinSuccess, setJoinSuccess] = useState(false);
  const inputArea = useRef(null);
  const socket = io.connect(SERVER);
  
  // const[guest, setGuest] = useState("");

  const navigate = useNavigate();
  // const [guest, setGuest] = useState("");
  const guest = useLocation().state.usn;
  // let { state: { Signguest } = {} } = useLocation(); //gets the variable we passed from navigate
  // setGuest(guest);
  console.log("join username: ", guest);

  useEffect( () => {
    socket.on("create-session-response", session_ID => {
      console.log("create session response from server")
      console.log(session_ID)
      setSessionID(session_ID)
      handleShow();
    }); 

    socket.on('join-session-success', usernames =>{
      //add usernames to local global data from data.usernames
      // socket.emit('joinRoom', {guest, sessionID}) 
      console.log(usernames);
      // let { state: { users } = {usernames} } = useLocation();
      let path = '/Room';
      navigate(path, {state:{sessionID, guest}});
    });

    socket.on('join-session-failed', ()=>{
      alert(`Session ID: ${sessionID} does not exist.`)
    });
  }, [socket])

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e.target.elements.session.value);
    console.log(sessionID)
    // handleShow();
    let data = {sessionID:sessionID, username:guest};
    socket.emit('join-session', data);
  }
  
  const joinSession = () => {
    console.log("join guest name ", guest);
    socket.emit('join-session', {guest, sessionID}) 
    // let path = '/Room';
    // navigate(path, {state:{sessionID, guest}});
  }
  // const joinSession = (join) => {
  //   socket.emit('join-session', { guest, sessionID });
  //   // let path = '/Room';
  //   // navigate(path, {state:{sessionID, guest}});
  // };

  const joinExistingSession = (j) => {
    j.preventDefault();
    console.log(sessionID);
    console.log(guest);
    socket.emit('room-exists', { guest, sessionID });
    console.log('fininishe joining');
  };

    // const joinExistingSession = (j) => {
    //   j.preventDefault();
    //   console.log(sessionID);
    //   socket.emit("room-exists", {guest, sessionID});
    // }

  const createSession = (room) => {
    room.preventDefault();
    handleShow();
    socket.emit("create-session", guest);
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
                        <div className='orange-session-id'>
                            <h2>Join Existing Jam Session</h2>
                            <br></br>
                            <form onSubmit={joinExistingSession} >
                                <input type="text" name="session" onChange={e => setSessionID(e.target.value)}  />
                                <input type="submit" value="Submit"/*className="a-button" *//> 
                            </form>
                        </div>
                    </Col>
                    <Col></Col>
                    <Col>
                            <div className='purple-new-id'>
                                <h2>Create New Jam Session</h2>
                                <br></br>
                                <Button variant="flat" className='join-button' flex style={{backgroundColor: "orange"}} onClick={createSession}>
                                    <h5>Create New ID</h5>
                                </Button>
                            </div>
                    </Col>
                    <Col></Col>
                </Row>
            </div>
        </div>
        </>
    );
}

export default Join;
