import React from 'react';
import ReactDOM from 'react-dom';
import { render } from 'react-dom';

import {
  Signup,
  Room,
  Join
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
      </Routes>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous"></link>
    </BrowserRouter>
  </div>,
  document.getElementById('root')
);

registerServiceWorker();
