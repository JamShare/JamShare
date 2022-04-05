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
        <Route path='/signup' element={<Signup />} />
        <Route path='/join' element={<Join />} />
        <Route path='/room' element={<Room />} />
      </Routes>
    </BrowserRouter>
  </div>,
  document.getElementById('root')
);

registerServiceWorker();
