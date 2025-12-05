import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, alpha, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import RouteIcon from '@mui/icons-material/Route';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PersonIcon from '@mui/icons-material/Person';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [officer, setOfficer] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const currentOfficer = localStorage.getItem('loggedInOfficer');
    if (currentOfficer) {
      setOfficer(JSON.parse(currentOfficer));
    }
  }, [location]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentOfficer');
    handleMenuClose();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/donations', label: 'Donations', icon: <VolunteerActivismIcon /> },
    { path: '/distributions', label: 'Distributions', icon: <LocalShippingIcon /> },
    { path: '/donors', label: 'Donors', icon: <PersonIcon /> },
    { path: '/officers', label: 'Officers', icon: <PeopleIcon /> },
    { path: '/receivers', label: 'Receivers', icon: <InventoryIcon /> },
    { path: '/routes', label: 'Routes', icon: <RouteIcon /> },
  ];

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important' }}>
        <Typography 
          variant="h6" 
          component={Link}
          to="/"
          sx={{ 
            flexGrow: 0, 
            mr: 4,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            textDecoration: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <VolunteerActivismIcon sx={{ fontSize: 28 }} />
          Donation Management System
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              startIcon={item.icon}
              sx={{
                color: location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.7)',
                bgcolor: location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent',
                borderRadius: 2,
                px: 2,
                py: 1,
                fontSize: '0.85rem',
                fontWeight: location.pathname === item.path ? 600 : 400,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: '#fff'
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
        
        {/* Profile Menu */}
        {officer && (
          <Box sx={{ ml: 2 }}>
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea' }}>
                {officer.name?.charAt(0) || 'O'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {officer.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {officer.officeName}
                </Typography>
              </Box>
              <Divider />
              <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                <AccountCircleIcon sx={{ mr: 1 }} fontSize="small" />
                My Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;