import React, { Fragment, useState, useEffect } from "react";
// import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import FormLabel from "react-bootstrap/esm/FormLabel";
// import { Link, Navigate, useNavigate } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import JamShareLogo from "./assets/images/JamShareLogo.jpg";

import axios from "axios";
import Cookies from "js-cookie";


function Signup(props) {
  const [guest, setGuest] = useState("");
  const [showModal, setModal] = useState(false);

  // const redirect = useState(false);
  const navigate = useNavigate();
  

  // let data = localStorage.getItem('guest');
  // const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setModal(false);
  const handleShow = () => setModal(true);
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;

  const [signup_usn, set_signup_usn] = React.useState("");
  const [signup_psw, set_signup_psw] = React.useState("");
  const [signin_usn, set_signin_usn] = React.useState("");
  const [signin_psw, set_signin_psw] = React.useState("");

  const checkPassword = (p) => {
    if (!regex.test(p) && p.length <= 30) handleShow();
  };

  //Redirect if cookie exists
  useEffect(() => {
    const [username, guest_username] = ["username", "guest_username"]
      .map(e=> Cookies.get("username"))

    console.log(username, guest_username)

    if (username) 
      navToJoin(username)
    else if(guest_username)
      navToJoin(guest_username) 
  }, []);

    
  const handleGuest = (e) => {
    e.preventDefault();
    console.log(guest);
    Cookies.set("guest_username", e.target.value, {
      expires: 1,
    });
    // setGuest(e.target.value);
    Cookies.set("sessionID", Math.random().toString(36).substr(2, 9), {
      expires: 1,
    });    
    
    navToJoin(guest);
  };

  const navToJoin = (usn) => {
    console.log("navtojoin ", usn);
    navigate("./Join", { state: { usn } });
  };


  const handleSignup = (e) => {
    e.preventDefault();
    axios
      .post("/auth/signup", {
        username: signup_usn,
        password: signup_psw,
      })
      .then((res) => {
        if (res.data == true) {
          alert(`Thanks for signing in ${signup_usn}`);
          Cookies.set("username", signup_usn, {
            expires: 1,
          });

          Cookies.set("sessionID", Math.random().toString(36).substr(2, 9), {
            expires: 1,
          });
          
          navToJoin(signup_usn);

        } else alert("Account name taken.");
      })
      .catch((err) => console.log(err));
  };

  const handleSignin = (e) => {
    e.preventDefault();

    axios.post('/auth/signin', {
        username: signin_usn,
        password: signin_psw,
    }).then(res => {
        if (res.data == true) {
            alert(`Thanks for signing in ${signin_usn}`)
            Cookies.set('username', signin_usn, {
                expires: 1
            });
        
            Cookies.set('sessionID', Math.random().toString(36).substr(2, 9), {
                expires: 1
            });       
            
            navToJoin(signin_usn);


        } else
            alert('Unsuccessful login.');

    }).catch(err => console.log(err));
}

  // render() {
  return (
    <>
      <Modal show={showModal} onHide={handleClose} enforceFocus={true}>
        <Modal.Header closeButton>
          <Modal.Title>Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Must enter a guest name that is less than 15 characters
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="Signup bgcolor">
        <div className="banner" aria-label="pageBanner">
          <img className="jamshare-logo" src={JamShareLogo} alt="logo" />
        </div>
        <br></br>
        <h1 className={'gentext orange'}>Let's get Jammin'</h1>
        <div className='childbox'>
          <br></br>
          <div className="signupbox" aria-label="signInOrUpCredentialBoxes">
            <div className="childbox-signups" aria-label="signInWithExistingAccount">
              <h2 className="purple-text">Sign In</h2>
              <form onSubmit={handleSignin}>
                <br></br>
                <FormLabel id="signinUsernameLabel" for="signinUsername" className={"purple"}>Username </FormLabel>
                <Form.Control
                  type="username"
                  placeholder="Enter Username"
                  onChange={(e) => set_signin_usn(e.target.value)}
                  value={signin_usn}
                  id="signinUsername"
                />
                
                <FormLabel id="signinPasswordLabel" for="signinPassword" className={"purple"}>Password </FormLabel>
                <Form.Control
                  type="password"
                  placeholder="Enter Password"
                  onChange={(e) => set_signin_psw(e.target.value)}
                  value={signin_psw}
                  id="signinPassword"
                />
                <br></br>
                <Button variant="primary" type="submit" color="orange">
                  Sign In and Jam!
                </Button>
              </form>
            </div>

            <div className="childbox-signups" aria-label="signUpWithNewAccount">
              <h2 className="purple-text">Sign Up</h2>
              <form onSubmit={handleSignup}>
              <br></br>
                <FormLabel id="signupUsernameLabel" for="signupUsername" className={"purple"}>Username </FormLabel>
                <Form.Control
                  type="username"
                  placeholder="Enter Username"
                  onChange={(e) => set_signup_usn(e.target.value)}
                  value={signup_usn}
                  id="signupUsername"
                />
                <FormLabel id="signupPasswordLabel" for="signupPassword" className={"purple"}>Password </FormLabel>
                <Form.Control
                  type="password"
                  placeholder="Enter Password"
                  onChange={(e) => set_signup_psw(e.target.value)}
                  value={signup_psw}
                  id="signupPassword"
                />{" "}
                <br></br>
                <Button variant="primary" type="submit" color="orange">
                  Sign Up and Jam!
                </Button>
              </form>
            </div>
          </div>

          <div className="childbox-guest" aria-label="signInAsGuest">
            <h2 className="purple-text">Continue as Guest</h2>
            <Form onSubmit={handleGuest}>
              <Form.Group className="mb-3" controlID="formBasicUsername">
                <FormLabel id="guestUsernameLabel" for="guestUsername" className={"purple"}> Username </FormLabel>
                <Form.Control
                  type="username"
                  name="guest"
                  placeholder="Enter Username"
                  onChange={(e) => setGuest(e.target.value)}
                  id="guestUsername"
                />
              </Form.Group>
              {/* can't get button to fit styling (purple color) without changing to Link type */}
              <Button variant='primary' type='submit' color='orange'>
                Jam as a Guest!
              </Button>
              {/* <Link to="/join" className="a-button">
                  Sign Up and Jam!
              </Link> */}
            </Form>
          </div>
        </div>
      </div>
      <div class="jybannerb">
        Portland State University - JamShare - 2022 -&nbsp;
        <a className="about-us" href="https://github.com/JamShare">About Us</a>
      </div>
    </>
  );
  // }
}

export default Signup;
