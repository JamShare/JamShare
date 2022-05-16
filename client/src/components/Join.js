import React, { useEffect, useState, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormLabel from "react-bootstrap/esm/FormLabel";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Socket } from 'socket.io-client';
import Modal from 'react-bootstrap/Modal';

import JoinModal from './JoinModal';
const io = require('socket.io-client');
const SERVER = "http://localhost:3001";
// Join or create a Jam session room with link ID
function Join(props) {

    const [sessionID, setSessionID] = useState("");
    const [showModal, setModal] = useState(false);
    const handleClose = () => setModal(false);
    const handleShow = () => setModal(true);
    const [copied, setCopied] = useState(false);
    const [joinSuccess, setJoinSuccess] = useState(false);
    const inputArea = useRef(null);
    const socket = io.connect(SERVER);
    //breaks rendering
    const navigate = useNavigate();
    let { state: { guest } = {} } = useLocation(); //gets the variable we passed from navigate
  

    useEffect( () => {
      socket.on("create-session-response", session_ID => {
        console.log("create session request to server")
        console.log(session_ID)
        setSessionID(session_ID)
        handleShow();
      }) 
      socket.on('join-session-success', ()=>{
        //add usernames to local global data from data.usernames
        socket.emit('joinRoom', {guest, sessionID}) 
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
    
    const joinSession = (join) => {
        socket.emit('joinRoom', {guest, sessionID}) 
        let path = '/Room';
        navigate(path, {state:{sessionID, guest}});
    }

    const joinExistingSession = (j) => {
      j.preventDefault();
      console.log(sessionID);
      socket.emit("room-exists", {guest, sessionID});
    }

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
              {guest}, share this link with your fellow Jammers
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
            <Button onClick={copyLink}>copy to clipboard</Button>
            <Button onClick={joinSession} >Join Session</Button>
            <Button onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
        <div id="container"  className={'centered'} >
            <Container>
                <Row>
                    <Col></Col>
                    <Col>
                        <Row>Join existing </Row>
                        <Row>Jam Session</Row> 
                        <div className={'session-id'}>
                            <br></br>
                                    <label>session id:</label>
                                    <br></br>
                                    <br></br>
                            <div >
                            <form onSubmit={joinExistingSession} >
                                        <input type="text" name="session" onChange={e => setSessionID(e.target.value)}  />
                                        <input type="submit" value="Submit"/*className="a-button" */ /> 
                                    </form>
                            </div>
                        </div>
                    </Col>
                    <Col></Col>
                    <Col>
                        <Row>Create New</Row>
                        <Row>Jam Session</Row> 
                        <div >
                            <Button variant="flat" className='join-button' flex style={{backgroundColor: "pink"}} onClick={createSession} >
                                create new ID/Link
                            </Button>
                        </div>
                    </Col>
                    <Col></Col>
                </Row>
            </Container>
        </div>
        </>
    );
}

export default Join;