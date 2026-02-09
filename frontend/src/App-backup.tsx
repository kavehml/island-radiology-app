import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Sites from './pages/Sites';
import Radiologists from './pages/Radiologists';
import Procedures from './pages/Procedures';
import Calendar from './pages/Calendar';
import Orders from './pages/Orders';
import Optimization from './pages/Optimization';
import './styles/App.css';

const App = () => {
  return (
    <Router>
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
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sites" element={<Sites />} />
            <Route path="/radiologists" element={<Radiologists />} />
            <Route path="/procedures" element={<Procedures />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/optimization" element={<Optimization />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

