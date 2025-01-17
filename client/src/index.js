import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import './index.css';

import Start from './routes/start';
import Login from './routes/login';
import SignUp from './routes/signup';

export function Header() {
  return (
    <header>
      <h1>JustFitness</h1>
      <div>
        <Link class="Button1" to="/signup">Sign Up</Link>
        <Link class="Button1" to="/login">Log In</Link>
      </div>
    </header>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <BrowserRouter>
      <Header/>
      <Routes>
        <Route path='/' element={<Start/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/signup' element={<SignUp/>}></Route>
      </Routes>
    </BrowserRouter>
  </>
);