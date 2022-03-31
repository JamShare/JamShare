import React from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormLabel from "react-bootstrap/esm/FormLabel";
import GoogleLogin from 'react-google-login';
import { Navigate } from "react-router-dom";

export class Landing extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      guest: "",
      redirect: false
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(e.target.elements.username.value)
    this.setState({
      redirect: true
    })
  }

  render() {
    const handleFailure = (result) => {
      alert(result);
    };
    const handleLogin = (googleData) => {
      console.log(googleData);
    };
    const { redirect } = this.state;

    if(redirect === true) {
       <Navigate to="/join" replac={true} />;
    }

    return (
      <Container fluid>
          <Row className="justify-content-lg-center">JamShare</Row>
          <Row>
            <Col>
              <Container>
                  <Row>Sign in</Row>
                  <Row>
                    <Form>
                        <Form.Group className="mb-3" controlID="formBasicUsername">
                          <Form.Label>Username </Form.Label>
                          <Form.Control type="username" placeholder="enter username" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                          <Form.Label>Password</Form.Label>
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
                    <Form>
                        <Form.Group className="mb-3" controlID="formBasicUsername">
                          <Form.Label>Username </Form.Label>
                          <Form.Control type="username" placeholder="enter username" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                          <Form.Label>Email address</Form.Label>
                          <Form.Control type="email" placeholder="Enter email" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                          <Form.Label>Password</Form.Label>
                          <Form.Control type="password" placeholder="Password" />
                          </Form.Group>
                    </Form>
                    <GoogleLogin
                      clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                      buttonText="log in with Google"
                      onSuccess={handleLogin}
                      onFailure={handleFailure}
                      cookiePolicy={'single_host_origin'}
                    ></GoogleLogin>
                </Row>
              </Container>
            </Col>
          </Row>
          <Row>
            <Container flex>
              <Row>Continue as guest</Row>
              <Row>
                <Form onSubmit={this.handleSubmit}>
                  <Form.Group className="mb-3" controlID="formBasicUsername">
                    <Form.Label>Username </Form.Label>
                    <Form.Control type="username" name="username" placeholder="enter username" />
                  </Form.Group>
                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                </Form>
              </Row>
            </Container>
          </Row>
        </Container>
    );
  }
}

export default Landing;
