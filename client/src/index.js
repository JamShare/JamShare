import React from 'react';
import ReactDOM from 'react-dom';
import { Signup, Room, Join, MorgSignup, MorgSignin, } from './components/component_export';
import './fonts/Indie_Flower/IndieFlower-Regular.ttf';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const io = require('socket.io-client');
const SERVER = "https://gentle-lake-00593.herokuapp.com";
let socket = io(SERVER);
export default socket; //https://stackoverflow.com/questions/48794919/reactjs-socket-io-best-way-to-handle-socket-connection

socket.on('error', (error) => {
  console.log('server error', error);
});

ReactDOM.render(
  <div>
    <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<Signup />} />
        <Route path='/join' element={<Join />} />
        <Route path='/room' element={<Room />} />
        <Route path='/signup2' element={<MorgSignup />} />
        <Route path='/signin2' element={<MorgSignin />} />
      </Routes>
      <link
        rel='stylesheet'
        href='https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css'
        integrity='sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2'
        crossOrigin='anonymous'></link>
      <script src='https://unpkg.com/react@16.0.0/umd/react.production.min.js'></script>
      <script src='https://unpkg.com/react-copy-to-clipboard/build/react-copy-to-clipboard.js'></script>
    </BrowserRouter>
  </div>,
  document.getElementById('root')
);

