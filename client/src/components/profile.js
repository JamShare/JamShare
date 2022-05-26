import React from "react";
import {
    Link,
    Navigate
} from "react-router-dom";
import axios from 'axios';
import Cookies from "js-cookie";
import {
    Card,
    Form,
    Input,
    Button
} from "./styled_components";
import ProfilePic from "./profilePic";

export class Profile extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
            };

            this.handleChange = this.handleChange.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
        }

        handleChange({
            target
        }) {
            this.setState({
                [target.name]: target.value
            });
        }

        handleSubmit(event) {

        }

  
  render() {
    return(
        <div>
        <ProfilePic />
        <p>dog love eggs</p>
        </div>
      )
  }
}

export default Profile
