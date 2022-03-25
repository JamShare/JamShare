import React from 'react';
import ReactDOM from 'react-dom';
import { render } from 'react-dom';
import {
  Nav,
  Landing,
  Signup,
  Room,
  Chat,
} from './components/component_export';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

ReactDOM.render(
  <div>
    <BrowserRouter>
      <Routes>
        <Route path='/landing' element={<Landing />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/room' element={<Room />} />
        <Route path='/chat' element={<Chat />} />
      </Routes>
    </BrowserRouter>
  </div>,
  document.getElementById('root')
);

registerServiceWorker();
