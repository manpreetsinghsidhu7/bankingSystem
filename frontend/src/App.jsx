import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import Settings from './pages/Settings';
import CreateAccount from './pages/CreateAccount';
import Contact from './pages/Contact';
import ATM from './pages/ATM';
import AdminAccounts from './pages/AdminAccounts';
import AdminRequests from './pages/AdminRequests';
import AdminTransactions from './pages/AdminTransactions';
import AdminBank from './pages/AdminBank';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes — Users only */}
            <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/payments" element={<Transfer />} />
              <Route path="/atm" element={<ATM />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<Navigate to="/admin/accounts" replace />} />
              <Route path="/admin/accounts" element={<AdminAccounts />} />
              <Route path="/admin/requests" element={<AdminRequests />} />
              <Route path="/admin/transactions" element={<AdminTransactions />} />
              <Route path="/admin/bank" element={<AdminBank />} />
            </Route>
          </Routes>
        </AuthProvider>
        <Toaster 
          position="top-center"
          containerStyle={{ top: 72 }}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
              border: '1px solid rgba(255,255,255,0.06)',
              fontSize: '13px',
              fontWeight: '500',
              padding: '12px 18px',
              maxWidth: '360px',
            },
            success: {
              iconTheme: { primary: '#f59e0b', secondary: '#1e293b' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#1e293b' },
            },
          }}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;

