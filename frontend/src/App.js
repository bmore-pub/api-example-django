import React from 'react';
import './App.css';
import Dashboard from './Dashboard';

function App() {
  const prefix = location.protocol == 'http:' ? 'ws:' : 'wss:'
  const url = prefix + '//' + location.host + '/test-socket'
  const socketConn = new WebSocket(url)
  return (
    <Dashboard socketConn={socketConn} />
  );
}

export default App;
