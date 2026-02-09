import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sites from './pages/Sites';
import Radiologists from './pages/Radiologists';
import Procedures from './pages/Procedures';
import Calendar from './pages/Calendar';
import Orders from './pages/Orders';
import Optimization from './pages/Optimization';
import Users from './pages/Users';
import RequisitionSubmit from './pages/RequisitionSubmit';
import Requisitions from './pages/Requisitions';
import PatientPortal from './pages/PatientPortal';
import './styles/App.css';

const AppContent = () => {
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/patient-portal" element={<PatientPortal />} />
        <Route path="/requisition-submit" element={<RequisitionSubmit />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h1>Island Radiology Management</h1>
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/sites">Sites</Link>
          <Link to="/radiologists">Radiologists</Link>
          <Link to="/procedures">Procedures</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/optimization">Optimization</Link>
          {hasRole(['admin', 'staff']) && <Link to="/requisitions">Requisitions</Link>}
          {hasRole('admin') && <Link to="/users">Users</Link>}
          <Link to="/requisition-submit" className="requisition-link">Submit Requisition</Link>
          <div className="user-menu">
            <span className="user-name">{user?.name} ({user?.role})</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sites"
            element={
              <ProtectedRoute requiredRole={['admin', 'staff']}>
                <Sites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/radiologists"
            element={
              <ProtectedRoute requiredRole={['admin', 'radiologist', 'staff']}>
                <Radiologists />
              </ProtectedRoute>
            }
          />
          <Route
            path="/procedures"
            element={
              <ProtectedRoute>
                <Procedures />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/optimization"
            element={
              <ProtectedRoute requiredRole={['admin', 'staff']}>
                <Optimization />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <Users />
              </ProtectedRoute>
            }
          />
          <Route path="/requisition-submit" element={<RequisitionSubmit />} />
          <Route path="/patient-portal" element={<PatientPortal />} />
          <Route
            path="/requisitions"
            element={
              <ProtectedRoute requiredRole={['admin', 'staff']}>
                <Requisitions />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
