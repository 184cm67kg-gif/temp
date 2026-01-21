import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { MeetingView } from './pages/Meeting/MeetingView';
import { RepositoryChatView } from './components/meeting/RepositoryChatView';

import { useStore } from './store/scenarioStore';

function App() {
  const initialize = useStore((state) => state.initialize);

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="repo/:repoId" element={<RepositoryChatView />} />
          <Route path="issue/:issueId" element={<MeetingView viewType="ISSUE" />} />
          <Route path="branch/:branchId" element={<MeetingView viewType="BRANCH" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

