// eslint-disable-next-line import/no-unresolved
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { DashboardList } from '../components/dashboard/dashboard-list.js';
import Dashboard from '../components/dashboard/dashboard.js';
import { NotFound } from '../components/not-found.js';

export default function Home () {
  return (
    <Router>
      <Routes>
        <Route path="/dashboards/:route" element={<Dashboard />} />
        {/* @ts-ignore */}
        <Route exact path="/dashboards" element={<DashboardList />} />
        <Route path="/" element={<DashboardList />} />
        <Route element={<NotFound />} />
      </Routes>
    </Router>
  );
}