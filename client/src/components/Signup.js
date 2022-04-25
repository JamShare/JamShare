import React, { Fragment, useState} from "react"
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormLabel from "react-bootstrap/esm/FormLabel";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Modal from 'react-bootstrap/Modal';

import { Transition, Dialog } from "@headlessui/react";
// export class Signup extends React.Component {
//   constructor(props) {
//     super(props);
  
function Signup () {
  const [guest, setGuest] = useState("");
  const [showModal, setModal] = useState(false);
  const redirect = useState(false);
  const navigate = useNavigate();
  let data = localStorage.getItem('guest');
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setModal(false);
  const handleShow = () => setModal(true);
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;

  const checkPassword = (p) => {
    if(!regex.test(p) && p.length <= 30)
      handleShow();
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    if (guest.length > 15 || guest.length == 0){
      handleShow()
      return;
    }
    let path = '/Join';
    console.log(guest);
    navigate(path, {state:{guest}}); //navigate redirects to join and gets the guest state
  }
  // render() {
    return (
      <>
            <Modal show={showModal} onHide={handleClose} enforceFocus={true} >
          <Modal.Header closeButton>
            <Modal.Title>Alert</Modal.Title>
          </Modal.Header>
          <Modal.Body>Must enter a guest name that is less than 15 characters</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleClose}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
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
            <Form onSubmit={handleSubmit} >
              <Form.Group className="mb-3" controlID="formBasicUsername">
                <FormLabel className={"purple"}>Username </FormLabel>
                <Form.Control type="username" name="guest" placeholder="Enter Username" onChange={e => setGuest(e.target.value)} />
              </Form.Group>
              <br></br>
              <br></br>
              <Button variant="primary" type="submit"  /*className="a-button" */>
                Jam as a Guest!
              </Button>
            </Form>
          </div>
        </div>

      </div>
      </>
    );
  // }
}

export default Signup;
