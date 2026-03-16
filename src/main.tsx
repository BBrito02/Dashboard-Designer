// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // <-- Change this import to App
import './index.css';
import { ModalHost } from './components/ui/ModalHost';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Keep ModalHost so that Editor can still use modals when rendered */}
    <ModalHost>
      <App /> {/* <-- Render App instead of Editor */}
    </ModalHost>
  </React.StrictMode>,
);
