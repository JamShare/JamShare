import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormLabel from 'react-bootstrap/esm/FormLabel';

import { io } from 'socket.io-client';

class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      message: '',
      messages: [],
    };
    this.socket = io();
    this.socket.on('RECEIVE_MESSAGE', function (data) {
      addMessage(data);
    });

    const addMessage = (data) => {
      console.log(data);
      this.setState({ messages: [...this.state.messages, data] });
      console.log(this.state.messages);
    };

    this.sendMessage = (ev) => {
      ev.preventDefault();
      this.socket.emit('SEND_MESSAGE', {
        author: this.state.username,
        message: this.state.message,
      });
      this.setState({ message: '' });
    };
  }

  render() {
    return (
      <div className='chat'>
        <div className='chat-container'>
          <div className='chat-body'>
            <div className='chat-title'>Live Chat</div>
            <hr />
            <div className='messages'>
              {this.state.messages.map((message) => {
                return (
                  <div>
                    {message.author}: {message.message}
                  </div>
                );
              })}
            </div>
          </div>
          <div className='chat-elements'>
            <input
              type='text'
              placeholder='Username'
              value={this.state.username}
              onChange={(ev) => this.setState({ username: ev.target.value })}
              className='form-control'
            />
            <br />
            <input
              type='text'
              placeholder='Message'
              className='form-control'
              value={this.state.message}
              onChange={(ev) => this.setState({ message: ev.target.value })}
            />
            <br />
            <button
              onClick={this.sendMessage}
              className='btn btn-primary form-control'>
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Chat;
