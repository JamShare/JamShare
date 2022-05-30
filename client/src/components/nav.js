import React from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormLabel from "react-bootstrap/esm/FormLabel";


// import TodoContainer from "./components/TodoContainer" 
//Style Sheet


export class Nav extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
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
                <Form className={"childbox"}>
                  <Form.Group className="mb-3" controlID="formBasicUsername">
                    <Form.Label className={"purple"}>Username </Form.Label>
                    <Form.Control type="username" placeholder="enter username" />
                  </Form.Group>
                </Form>
              </Row>
            </Container>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Nav;
