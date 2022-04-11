import React from "react";
// import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
// import Button from 'react-bootstrap/Button';
import FormLabel from "react-bootstrap/esm/FormLabel";
import { Link } from "react-router-dom";

export class Signup extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    return (
      <div class='Signup' className={"bgcolor"}>
        <div class="jamshare-logo">
          <img src='./assets/images/JamShareLogo.jpg' alt=""></img>
          <h1 className={"gentext orange"}>JamShare Logo Here!</h1>
        </div>
        <div class="childbox">
          <h1 className={"gentext orange"}>Let's get Jammin'</h1>
          {/* <div text-align="center">
            <h1 vertical-align="middle" display="inline-block">Sign In</h1>
            <h1 vertical-align="middle" display="inline-block">Sign Up</h1>
          </div> */}

          <div class="childbox-signups">
            <h1>Sign In</h1>
            <form>
              <FormLabel className={"purple"}>Username </FormLabel>
              <Form.Control type="username" placeholder="Enter Username" />
              <br></br>
              <FormLabel className={"purple"}>Password </FormLabel>
              <Form.Control type="password" placeholder="Enter Password" />
              <br></br>
              <br></br>
              <Link to="/join" className="a-button">
                Sign In and Jam!
              </Link>
            </form>
          </div>
          <div class="childbox-signups">
            <h1>Sign Up</h1>
            <form>
              <FormLabel className={"purple"}>Username </FormLabel>
              <Form.Control type="username" placeholder="Enter Username" />
              <br></br>
              <FormLabel className={"purple"}>Email </FormLabel>
              <Form.Control type="email" placeholder="Enter Valid Email" />
              <br></br>
              <FormLabel className={"purple"}>Password </FormLabel>
              <Form.Control type="password" placeholder="Enter Password" />
              <br></br>
              <br></br>
              <Link to="/join" className="a-button">
                Sign Up and Jam!
              </Link>
            </form>
          </div>
          <div class="childbox-guest">
            <h1>Continue as Guest</h1>
            <FormLabel className={"purple"}>Username </FormLabel>
            <Form.Control type="username" placeholder="Enter Username" />
            <br></br>
            <br></br>
            <Link to="/join" className="a-button">
              Jam as a Guest!
            </Link>
          </div>
        </div>
      </div>

      // <div class='Signup' className={"bgcolor"}>
      //   <Container fluid className={"gentext orange"}>
      //     <Row className="justify-content-lg-center">JamShare</Row>
      //     <Row>
      //       <Col>
      //         <Container>
      //             <Row>Sign in</Row>
      //             <Row>
      //               <Form className={"childbox"}>
      //                   <Form.Group className="mb-3" controlID="formBasicUsername">
      //                     <Form.Label className={"purple"}>Username </Form.Label>
      //                     <Form.Control type="username" placeholder="Enter Username" />
      //                   </Form.Group>
      //                   <Form.Group className="mb-3" controlId="formBasicPassword">
      //                     <Form.Label className={"purple"}>Password</Form.Label>
      //                     <Form.Control type="password" placeholder="Password" />
      //                   </Form.Group>
      //               </Form>
      //             </Row>
      //           </Container>
      //       </Col>
      //       <Col>
      //         <Container>
      //           <Row>Sign up</Row>
      //             <Row>
      //               <Form className={"childbox"}>
      //                   <Form.Group className="mb-3" controlID="formBasicUsername">
      //                     <Form.Label className={"purple"} >Username </Form.Label>
      //                     <Form.Control type="username" placeholder="Enter Username" />
      //                   </Form.Group>
      //                   <Form.Group className="mb-3" controlId="formBasicEmail">
      //                     <Form.Label className={"purple"}>Email address</Form.Label>
      //                     <Form.Control type="email" placeholder="Enter email" />
      //                   </Form.Group>
      //                   <Form.Group className="mb-3" controlId="formBasicPassword">
      //                     <Form.Label className={"purple"}>Password</Form.Label>
      //                     <Form.Control type="password" placeholder="Password" />
      //                     </Form.Group>
      //               </Form>
      //           </Row>
      //         </Container>
      //       </Col>
      //     </Row>
      //     <Row>
      //       <Container>
      //         <Row>Continue as guest</Row>
      //         <Row>
      //           <Form className={"childbox"}>
      //             <Form.Group className="mb-3" controlID="formBasicUsername">
      //               <Form.Label className={"purple"}>Username </Form.Label>
      //               <Form.Control type="username" placeholder="Enter Username" />
      //             </Form.Group>
      //           </Form>
      //         </Row>
      //       </Container>
      //     </Row>
      //   </Container>
        // <Link to="/join" className="a-button">
        //   Jam!
        // </Link>
      // </div>
    );
  }
}

export default Signup;
