import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import handleSubmit from './Join.js';
import CopyToClipboard from 'react-copy-to-clipboard';
function JoinModal(props) {
  const [copied, setCopied] = useState(false);
  const inputArea = useRef(null);

  function updateClipboard(newClip) {
    navigator.clipboard.writeText(newClip).then(
      () => {
        setCopied("Copied!");
      },
      () => {
        setCopied("Copy failed!");
      }
    );
  }
  
  function copyLink() {
    navigator.permissions
      .query({ name: "clipboard-write" })
      .then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
          updateClipboard(inputArea.current?.innerText);
        }
      });
  }
    return (
      <Modal {...props} aria-labelledby="contained-modal-title-vcenter"
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
              {props.title}, share this link with your fellow Jammers
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="show-grid">
          <Container>
            <Row>
              <Col lg={4}></Col>
                <Col lg={4} id="a" ref={inputArea} >
                  {props.data}
                </Col>
              <Col lg={4}></Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={copyLink}>copy to clipboard</Button>
            <Button onClick={handleSubmit} >Join Session</Button>
            <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
export default JoinModal;