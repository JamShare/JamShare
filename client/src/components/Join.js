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

// Join or create a Jam session room with link ID
function Join() {

    const [sessionID, setSessionID] = useState("");
    const [showModal, setModal] = useState(false);
    const handleClose = () => setModal(false);
    const handleShow = () => setModal(true);

    //breaks rendering
    const navigate = useNavigate();
    let { state: { guest } = {} } = useLocation(); //gets the variable we passed from navigate
   //room code is invalid  
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(guest)
        console.log(e.target.elements.session.value)
        let path = '/Room';
        handleShow();
        navigate(path, {state:{sessionID, guest}});
    }

    console.log(guest);
    return (
        <div id="container" >
            <Container flex style={{backgroundColor:"silver"}}>
                <Row>
                    <Col>
                        <Row>Join existing </Row>
                        <Row>Jam Session</Row> 
                        <Container flex style={{backgroundColor: "orange"}}>
                            <Row>
                                <label>session id:</label>
                            </Row>
                            <Row>
                                <form onSubmit={handleSubmit} >
                                    <input type="text" name="session" onChange={e => setSessionID(e.target.value)}  />
                                    <input type="submit" value="Submit"/*className="a-button" */ /> 
                                </form>
                            </Row>
                        </Container>
                    </Col>
                    <Col>
                        <Row>Create New</Row>
                        <Row>Jam Session</Row> 
                        <Container flex style={{backgroundColor: "pink"}}>
                            <Row>Create new</Row>
                            <Row>Jam session</Row>
                        </Container>
                    </Col>
                </Row>
                <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleClose}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
            </Container>
        </div>
    );
}

export default Join;