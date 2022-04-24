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
        <Route path='/signup' element={<Signup />} />
        <Route path='/join' element={<Join />} />
        <Route path='/room' element={<Room />} />
        <Route path='/signup2' element={<Morg_Signup />} />
        <Route path='/signin2' element={<Morg_Signin />} />
      </Routes>
    </BrowserRouter>
  </div>,
  document.getElementById('root')
);

registerServiceWorker();
