import React, { useEffect, useState, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormLabel from "react-bootstrap/esm/FormLabel";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
// Join or create a Jam session room with link ID
function Join() {

    const [sessionID, setSessionID] = useState("");
    
    //breaks rendering
    // const navigate = useNavigate();
    // let { state: { guest } = {} } = useLocation(); //gets the variable we passed from navigate
    
    const handleSubmit = (e) => {
    //   e.preventDefault();
    //   console.log(guest)
    //   console.log(e.target.elements.session.value)
    //   let path = '/room';
    //   navigate(path, {state:{sessionID, guest}});
    }


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
                                    <Link to="/room" className="a-button">submit</Link>
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
            </Container>
        </div>
    );
}

export default Join;