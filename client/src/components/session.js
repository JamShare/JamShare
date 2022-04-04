import React, { useState } from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Blue from './img/blue.png';
import Button from "react-bootstrap/esm/Button";
import ButtonGroup from "react-bootstrap/esm/ButtonGroup";
import DropdownButton from "react-bootstrap/esm/DropdownButton";
import Dropdown from "react-bootstrap/esm/Dropdown";
import Play from './img/play.png';
import Record from './img/record.png';

const play = require('./img/play.png')
const record = require('./img/record.png')
const button = {play, record};
//export class Session extends React.Component {
function Session(){

    const [selected, set] = useState(button.play);

//    getImage = () => this.state.open ? 'play' : 'record';

    return (
          <Container fluid>
              <Row>
                  <Col>
                  Jammers
                    <Container fluid>
                        username
                        <Row>
                          <Col>
                            <DropdownButton src={Blue} as={ButtonGroup} title="Dropdown" id="bg-nested-dropdown">
                              <Dropdown.Item eventKey="1">ahhhh</Dropdown.Item>
                              <Dropdown.Item eventKey="2">shhhhh</Dropdown.Item>
                            </DropdownButton>
                          </Col>
                          <Col></Col>
                        </Row>
                    </Container>
                  </Col>
                  <Col>
                    Recordings
                    <Container fluid>
                        noise
                    </Container>
                  </Col>
                  <Col>
                    Jam
                    <Container fluid>
                      <Row> <Image src={selected} onClick={() => set(button.record)} fluid/></Row>

                    </Container>
                  </Col>
              </Row>
          </Container>
    );
}
  


export default Session;