import React from 'react';
import ReactDOM from 'react-dom';
import { render } from 'react-dom';

import {
  Signup,
  Room,
  Join,
  Morg_Signup,
  Morg_Signin
} from './components/component_export';


import registerServiceWorker from './registerServiceWorker';

import './fonts/Indie_Flower/IndieFlower-Regular.ttf';
import './index.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Socket } from 'socket.io-client';

ReactDOM.render(
  <div>
    <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<Signup />} />
        <Route path='/join' element={<Join />} />
        <Route path='/room' element={<Room />} />
        <Route path='/signup2' element={<Morg_Signup />} />
        <Route path='/signin2' element={<Morg_Signin />} />
      </Routes>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous"></link>
      <script src="https://unpkg.com/react@16.0.0/umd/react.production.min.js"></script>
      <script src="https://unpkg.com/react-copy-to-clipboard/build/react-copy-to-clipboard.js"></script>
    </BrowserRouter>
  </div>,
  document.getElementById('root')
);

registerServiceWorker();
