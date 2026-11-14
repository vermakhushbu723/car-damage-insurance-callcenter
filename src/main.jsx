import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';

import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import antdTheme from './theme/antdTheme.js';
import './index.css';
import { BASENAME, enterPortal } from './portal.js';
import { getUser } from './auth/session.js';

const user = getUser();

if (enterPortal(user ? { role: user.roleKey, id: user.id } : null, user?.mustChangePassword ? '/login' : '/')) ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ConfigProvider theme={antdTheme}>
            <AntdApp>
                <BrowserRouter basename={BASENAME}>
                    <AppProvider>
                        <App />
                    </AppProvider>
                </BrowserRouter>
            </AntdApp>
        </ConfigProvider>
    </React.StrictMode>
);
