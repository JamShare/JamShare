import React from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormLabel from "react-bootstrap/esm/FormLabel";
import { Navigate, useNavigate } from "react-router-dom";
import Landing from "./landing";


export class Nav extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    function useLanding(){
      let navigate = useNavigate();
      const routeChange = () =>{
        let path = 'Landing';
        navigate(path);
      }
    }

    return (
      <div class='Nav'>
        <Container fluid>
          <Row>
            <h1>Jamshare</h1>
          </Row>
          <Row className="justify-content-lg-center">
            <Button 
            variant="primary" 
            size="lg"
            onClick={useLanding}
            > 
            Let's jam
            </Button>
            
          </Row>

        </Container>
      </div>
    );
  }
}

export default Nav;
