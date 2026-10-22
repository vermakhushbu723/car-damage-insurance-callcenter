import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';

import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import antdTheme from './theme/antdTheme.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ConfigProvider theme={antdTheme}>
            <AntdApp>
                <BrowserRouter>
                    <AppProvider>
                        <App />
                    </AppProvider>
                </BrowserRouter>
            </AntdApp>
        </ConfigProvider>
    </React.StrictMode>
);
