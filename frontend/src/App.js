import React from 'react';
import './App.css';
import FixedMenuLayout from './FixedMenuLayout';

function App() {
  const url = 'ws://' + location.host + '/test-socket'
  const socketConn = new WebSocket(url)
  return (
    <FixedMenuLayout socketConn={socketConn} />
  );
}

export default App;
