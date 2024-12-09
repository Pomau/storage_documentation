import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

import { AppLayout } from './components/Layout/AppLayout';
import { DocumentsPage } from './pages/DocumentsPage';
import { CreateDocumentPage } from './pages/CreateDocumentPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { DocumentPage } from './pages/DocumentPage';
import { DocumentSearchPage } from './pages/DocumentSearchPage';

dayjs.locale('ru');

export const App: React.FC = () => {
    return (
        <ConfigProvider locale={ruRU}>
            <HashRouter>
                <AppLayout>
                    <Routes>
                        <Route path="/" element={<Navigate to="/documents" replace />} />
                        <Route path="/documents/create" element={<CreateDocumentPage />} />
                        <Route path="/documents/search" element={<DocumentSearchPage />} />
                        <Route path="/documents/:id" element={<DocumentPage />} />
                        <Route path="/documents" element={<DocumentsPage />} />
                        <Route path="/approvals" element={<ApprovalsPage />} />
                        <Route path="*" element={<Navigate to="/documents" replace />} />
                    </Routes>
                </AppLayout>
            </HashRouter>
        </ConfigProvider>
    );
}; 