import React from "react"; 
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormLabel from "react-bootstrap/esm/FormLabel";

export class Join extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render(){
        return(
            <div>
                <Container flex style={{backgroundColor:"silver"}}>
                    <Row>
                        <Col>
                            <Row>Join existing </Row>
                            <Row>Jam Session</Row> 
                            <Container flex style={{backgroundColor: "orange"}}>
                               <Row>
                                   <label>session id:</label>
                               </Row>
                               <Row>
                                   <form>
                                        <input type="text" name="session" />
                                        <input type="submit" value="Submit" />
                                   </form>
                               </Row>
                            </Container>
                        </Col>
                        <Col>
                            <Row>Create New</Row>
                            <Row>Jam Session</Row> 
                            <Container flex style={{backgroundColor: "pink"}}>
                                <Row>Create new</Row>
                                <Row>Jam session</Row>
                            </Container>
                        </Col>
                    </Row>
                </Container>
            </div>

        )
    }

}

export default Join;