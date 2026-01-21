import { Link, Outlet } from 'react-router-dom';

export function WfLayout() {
  return (
    <div style={{ padding: '16px' }}>
      <nav style={{ padding: '12px 0', marginBottom: '16px' }}>
        <Link to="/wf" style={{ marginRight: '12px' }}>
          WF Home
        </Link>
        <Link to="/wf/dashboard" style={{ marginRight: '12px' }}>
          WF Dashboard
        </Link>
        <Link to="/wf/issue" style={{ marginRight: '12px' }}>
          WF Issue
        </Link>
        <Link to="/wf/branch">WF Branch</Link>
      </nav>
      <Outlet />
    </div>
  );
}
