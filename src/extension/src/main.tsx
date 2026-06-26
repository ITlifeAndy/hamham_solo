import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { WallpaperProvider } from './providers/WallpaperProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WallpaperProvider>
      <App />
    </WallpaperProvider>
  </React.StrictMode>,
);
