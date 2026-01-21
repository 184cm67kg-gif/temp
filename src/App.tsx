import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { MeetingView } from './pages/Meeting/MeetingView';
import { RepositoryChatView } from './components/meeting/RepositoryChatView';
import { useStore } from './store/scenarioStore';
import { WfLayout } from './pages/wf/WfLayout';
import { WfHome } from './pages/wf/WfHome';
import { WfDashboard } from './pages/wf/WfDashboard';
import { WfIssueView } from './pages/wf/WfIssueView';
import { WfBranchView } from './pages/wf/WfBranchView';

function AppInner() {
  const location = useLocation();
  const initialize = useStore((state) => state.initialize);
  const hasInitializedRef = React.useRef(false);

  const shouldInitialize = !location.pathname.startsWith('/wf') && !hasInitializedRef.current;

  React.useEffect(() => {
    if (shouldInitialize) {
      initialize();
      hasInitializedRef.current = true;
    }
  }, [initialize, shouldInitialize]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="repo/:repoId" element={<RepositoryChatView />} />
        <Route path="issue/:issueId" element={<MeetingView viewType="ISSUE" />} />
        <Route path="branch/:branchId" element={<MeetingView viewType="BRANCH" />} />
      </Route>
      <Route path="/wf" element={<WfLayout />}>
        <Route index element={<WfHome />} />
        <Route path="dashboard" element={<WfDashboard />} />
        <Route path="issue" element={<WfIssueView />} />
        <Route path="branch" element={<WfBranchView />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

export default App;
