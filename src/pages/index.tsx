import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { DashboardList } from 'ops-frontend/components/dashboard/dashboard-list';
import Dashboard from 'ops-frontend/components/dashboard/dashboard';
import { NotFound } from 'ops-frontend/components/not-found';

export default function Home () {
  return (
    <Router>
      <Routes>
        <Route path="/dashboards/:route" element={<Dashboard />} />
        <Route exact path="/dashboards" element={<DashboardList />} />
        <Route path="/" element={<DashboardList />} />
        <Route element={<NotFound />} />
      </Routes>
    </Router>
  );
}