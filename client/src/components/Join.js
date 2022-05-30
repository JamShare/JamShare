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
import { getSocketEndpoint } from './componentConfig';

import JoinModal from './JoinModal';
const io = require('socket.io-client');
//const SERVER = "http://localhost:3001";
const SERVER = getSocketEndpoint();
// Join or create a Jam session room with link ID
function Join() {

    const [sessionID, setSessionID] = useState("");
    const [showModal, setModal] = useState(false);
    const handleClose = () => setModal(false);
    const handleShow = () => setModal(true);
    const socket = io.connect(SERVER);
    //breaks rendering
    const navigate = useNavigate();
    let { state: { guest } = {} } = useLocation(); //gets the variable we passed from navigate
   //room code is invalid  
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(e.target.elements.session.value);
        let path = '/Room';
        handleShow();
        navigate(path, {state:{sessionID, guest}});
    }
    const createSession = (room) => {
        room.preventDefault();
        handleShow();
        socket.on("create-session-response", session_ID => {
            console.log("create session worked ?...")
            console.log(session_ID)
            handleShow();
        })
        socket.emit("create-session", guest);
    }

    return (
        <>
        <JoinModal show={showModal} title={guest} data={sessionID} onHide={handleClose}></JoinModal>
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
                            <form onSubmit={handleSubmit} >
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