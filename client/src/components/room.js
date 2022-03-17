import React from "react";
import axios from "axios";

export class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      api_call_was_successful: false,
      api_result: "null;",
    };
  }

  componentDidMount() {
    //Appends "5678" to the input
    axios
      .post("/sample_request", {
        test: "1234",
      })
      .then((res) => {
        this.state.api_result = res.data;
        this.state.api_call_was_successful = true;
        this.validate();
      })
      .catch((err) => console.log(err));
  }

  validate = () => {
    const result = JSON.stringify(this.state.api_result);
    this.state.api_call_was_successful
      ? alert(`Result from test call:\n${result}`)
      : alert("API Call Failed");
  };

  render() {
    return (
      <div id="container">
        You are currently in {window.location.href}
        <br></br>
        Better pizza, better ingredients, papa johns.
        <br></br>
      </div>
    );
  }
}

export default Room;
