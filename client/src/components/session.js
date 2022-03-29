import React from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export class Session extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render() {
      return (
          <Container fluid>
              <Row>
                  <Col>
                  Jammers
                    <Container fluid>
                        username

                    </Container>
                  </Col>
                  <Col>
                    Recordings
                    <Container fluid>
                        noise
                    </Container>
                  </Col>
              </Row>

          </Container>
      );
    }
  }
  


export default Session;