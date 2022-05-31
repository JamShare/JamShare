import React, { Link } from "react";
import axios from 'axios';
import Cookies from "js-cookie";
import { Card, Form, Input, Button } from "./styled_components";

const LINK_TO_SIGNIN = "/signin2"

export class Morg_Signup extends React.Component {
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
        axios.post('/auth/signup', {
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
                window.location.reload();
            } else
                alert('Account name taken.');

        }).catch(err => console.log(err));

        event.preventDefault();
    }

    render() {
        return (
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
                <Link to={LINK_TO_SIGNIN}>Have an account?</Link>
            </Card>
        )
    }
}

export default Morg_Signup;