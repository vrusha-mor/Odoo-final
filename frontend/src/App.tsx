import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import VerifyOtp from './components/VerifyOtp';

import POS from './components/POS';
import KitchenDisplay from './components/KitchenDisplay';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Products from './components/Products';
import Categories from './components/Categories';
import FloorPlan from './components/FloorPlan';
import Orders from './components/Orders';
import Payments from './components/Payments';
import Customers from './components/Customers';

import './styles/app.css';

/* ============================
   AUTH & ROLE PROTECTION
============================ */

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/* ============================
   MAIN APP
============================ */

function App() {
  return (
    <Router>
      <Routes>
        {/* -------- PUBLIC ROUTES -------- */}
        <Route path="/login" element={<Login />} /> {/* Kept login and signup as public */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/orders" element={<Orders />} /> {/* Moved Orders to public */}
        <Route path="/kitchen" element={<KitchenDisplay />} /> {/* Added KitchenDisplay route */}
        <Route path="/" element={<Navigate to="/login" />} /> {/* Changed default redirect */}
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* -------- ADMIN DASHBOARD -------- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['1', '2', '3']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={['1', '2']}>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/category"
          element={
            <ProtectedRoute allowedRoles={['1', '2']}>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['1']}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* -------- POS / CASHIER -------- */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={['2']}>
              <POS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/floor-plan"
          element={
            <ProtectedRoute allowedRoles={['2']}>
              <FloorPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['2']}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute allowedRoles={['2']}>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={['2']}>
              <Customers />
            </ProtectedRoute>
          }
        />

        {/* -------- DEFAULT REDIRECT -------- */}
        <Route path="/" element={<RoleRedirect />} />
      </Routes>
    </Router>
  );
}

/* ============================
   ROLE BASED REDIRECT
============================ */

const RoleRedirect = () => {
  const role = localStorage.getItem('role');

  if (role) return <Navigate to="/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

export default App;
