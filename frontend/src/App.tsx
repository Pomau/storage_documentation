import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
            <BrowserRouter>
                <AppLayout>
                    <Routes>
                        <Route path="/" element={<Navigate to="/documents" replace />} />
                        <Route path="/documents" element={<DocumentsPage />} />
                        <Route path="/documents/create" element={<CreateDocumentPage />} />
                        <Route path="/approvals" element={<ApprovalsPage />} />
                        <Route path="/documents/:id" element={<DocumentPage />} />
                        <Route path="/documents/search" element={<DocumentSearchPage />} />
                    </Routes>
                </AppLayout>
            </BrowserRouter>
        </ConfigProvider>
    );
}; 