import React, { useState} from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormLabel from "react-bootstrap/esm/FormLabel";
import { Link, Navigate, useNavigate } from "react-router-dom";

function Signup () {

  const [guest, setGuest] = useState("");
  const redirect = useState(false);
  const navigate = useNavigate();
  let data = localStorage.getItem('guest');

  //const onChange = (event) => useState({ guest: event.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    let path = '/Join';
    console.log(guest);
    navigate(path, {state:{guest}});
  }


  return (
      <div id="container">
      <div class='Nav' className={"bgcolor"}>
        <Container fluid className={"gentext orange"}>
          <Row className="justify-content-lg-center">JamShare</Row>
          <Row>
            <Col>
              <Container>
                  <Row>Sign in</Row>
                  <Row>
                    <Form className={"childbox"}>
                        <Form.Group className="mb-3" controlID="formBasicUsername">
                          <Form.Label className={"purple"}>Username </Form.Label>
                          <Form.Control type="username" placeholder="enter username" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                          <Form.Label className={"purple"}>Password</Form.Label>
                          <Form.Control type="password" placeholder="Password" />
                          </Form.Group>
                    </Form>
                  </Row>
                </Container>
            </Col>
            <Col>
              <Container>
                <Row>Sign up</Row>
                  <Row>
                    <Form className={"childbox"}>
                        <Form.Group className="mb-3" controlID="formBasicUsername">
                          <Form.Label className={"purple"} >Username </Form.Label>
                          <Form.Control type="username" placeholder="enter username" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                          <Form.Label className={"purple"}>Email address</Form.Label>
                          <Form.Control type="email" placeholder="Enter email" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                          <Form.Label className={"purple"}>Password</Form.Label>
                          <Form.Control type="password" placeholder="Password" />
                          </Form.Group>
                    </Form>
                </Row>
              </Container>
            </Col>
          </Row>
          <Row>
            <Container>
              <Row>Continue as guest</Row>
              <Row>
                <Form className={"childbox"} onSubmit={handleSubmit} >
                  <Form.Group className="mb-3" controlID="formBasicUsername">
                    <Form.Label className={"purple"}>Username </Form.Label>
                    <Form.Control type="username" name="guest"  placeholder="enter guest name" onChange={e => setGuest(e.target.value)} />
                  </Form.Group>
                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                </Form>
              </Row>
            </Container>
          </Row>
        </Container>
      </div>
      </div>
  );
}

export default Signup;
