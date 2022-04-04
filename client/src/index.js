import React from 'react';
import ReactDOM from 'react-dom';
import { render } from "react-dom";
import {Nav, Landing, Signup, Room, Join, Session} from "./components/component_export"
import './index.css';
import { BrowserRouter as BrowserRouter, Routes, Route, Link } from "react-router-dom";

ReactDOM.render((
  render(
    <div>
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Landing />}/>
        <Route path="/signup" element={<Signup />}/>
        <Route path="/room:id" element={<Room />}/>
        <Route path="/join" element={<Join />}/>
        <Route path="/session" element={<Session />}/>
      </Routes>
    </BrowserRouter>
    </div>,
    document.getElementById("root")
  )
)); 