import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';

// Components
import Dashboard from './components/Dashboard';
import DonationManagement from './components/DonationManagement';
import RouteOptimization from './components/RouteOptimization';
import Navigation from './components/Navigation';
import Layout from './components/Layout';
import Login from './components/Login';
import Profile from './components/Profile';
import Donors from './pages/Donors';
import Officers from './pages/Officers';
import Receivers from './pages/Receivers';
import PersonDetail from './pages/PersonDetail';
import Distributions from './pages/Distributions';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const loggedInOfficer = localStorage.getItem('loggedInOfficer');
  
  if (!loggedInOfficer) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Login Route - No Layout */}
          <Route path="/login" element={<Login />} />
          
          {/* All other routes with Layout and Protection */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Navigation />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/donations" element={<DonationManagement />} />
                  <Route path="/routes" element={<RouteOptimization />} />
                  <Route path="/donors" element={<Donors />} />
                  <Route path="/officers" element={<Officers />} />
                  <Route path="/receivers" element={<Receivers />} />
                  <Route path="/distributions" element={<Distributions />} />
                  <Route path="/donor/:id" element={<PersonDetail type="donor" />} />
                  <Route path="/officer/:id" element={<PersonDetail type="officer" />} />
                  <Route path="/receiver/:id" element={<PersonDetail type="receiver" />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;