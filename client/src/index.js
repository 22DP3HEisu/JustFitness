import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import Start from './routes/start';

function Header() {
  return (
    <header>
      <h1>JustFitness</h1>
      <div>
        <button class="Button1">Sign Up</button>
        <button class="Button1">Log In</button>
      </div>
    </header>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div>
    <Header />
    <main>
      <Start />
    </main>
  </div>
);