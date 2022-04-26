import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
function JoinModal(props) {
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
              <Col lg={4}>
                  room id here
              </Col>
              <Col lg={4}></Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
            <Button>Join Session</Button>
            <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
export default JoinModal;