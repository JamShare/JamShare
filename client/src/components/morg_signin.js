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

const LINK_TO_SIGNUP = "/signup2"

export class Morg_Signin extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                username: "",
                password: "",
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
            axios.post('/auth/signin', {
                username: this.state.username,
                password: this.state.password,
            }).then(res => {
                if (res.data == true) {
                    alert(`Thanks for signing in ${this.state.username}`)
                    Cookies.set('username', this.state.username, {
                        expires: 1
                    });
                
                    Cookies.set('sessionID', Math.random().toString(36).substr(2, 9), {
                        expires: 1
                    });       
                    
                    alert(Cookies.get("sessionID"))

                    window.location.reload();

                } else
                    alert('Unsuccessful login.');

            }).catch(err => console.log(err));


            event.preventDefault();
        }

  render() {
     if(typeof Cookies.get("sessionID") !== "undefined"){
        return(<Navigate to="/" replace={true}/>);
     }

    return(
        <Card >
          <Form>
            <Input
              type="text"
              name="username"
              value={this.state.username}
              placeholder="username"
              onChange={this.handleChange}
            />
            <Input
              type="text"
              name="password"
              value={this.state.password}
              placeholder="password"
              onChange={this.handleChange}
            />
            <Button onClick={this.handleSubmit}>Sign In</Button>
          </Form>
          <Link to={LINK_TO_SIGNUP}>Don't have an account?</Link>
        </Card>
      )
  }

}

export default Morg_Signin
