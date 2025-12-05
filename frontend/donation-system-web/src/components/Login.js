import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import donationImage from '../utils/360_F_1694635620_DOezCQybjnOgWkxNYuXsuCbVxdJN2nfc.jpg';

const Login = () => {
  const [nicNumber, setNicNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!nicNumber) {
      setError('Please enter your NIC number');
      return;
    }

    // Validate NIC format (12 digits or 9 digits + V)
    const nicPattern = /^(\d{12}|\d{9}[Vv])$/;
    if (!nicPattern.test(nicNumber)) {
      setError('Invalid NIC format. Use 12 digits or 9 digits followed by V');
      return;
    }

    // Sanitize input - remove any special characters
    const sanitizedNIC = nicNumber.trim().toUpperCase();

    setLoading(true);
    try {
      // Fetch all officers
      const response = await fetch('http://localhost:5016/api/officers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch officers');
      }
      
      const officers = await response.json();

      // Find officer by NIC (case-insensitive comparison)
      const officer = officers.find(
        o => o.nicNumber?.toUpperCase() === sanitizedNIC
      );

      if (officer) {
        // Store officer data in localStorage
        localStorage.setItem('loggedInOfficer', JSON.stringify(officer));
        toast.success(`Welcome back, ${officer.name}!`);
        navigate('/');
      } else {
        setError('Invalid NIC number');
        toast.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login. Please try again.');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #78f7dbff 0%, #086666ff 100%)',
        p: 2,
      }}
    >
      <Grid container spacing={0} sx={{ maxWidth: 1200, width: '100%' }}>
        {/* Left side - Beautiful Illustration */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', p: 4 }}>
          <Box
            sx={{
              width: '100%',
              maxWidth: 500,
              height: 550,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #a0783cff 0%, #3a1a18ff 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              },
            }}
          >
            {/* Donation Box with Image */}
            <Box
              component="img"
              src={donationImage}
              alt="Food Donation"
              sx={{
                width: 300,
                height: 300,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '8px solid white',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                zIndex: 1,
              }}
            />
            <Box sx={{ textAlign: 'center', zIndex: 1, px: 3 }}>
              <Typography variant="h3" color="white" fontWeight="bold" gutterBottom>
                Donation Management
              </Typography>
              <Typography variant="h6" color="white" sx={{ opacity: 0.95 }}>
                Connecting hearts, delivering hope across Sri Lanka 
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Right side - Login Form */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper
            elevation={24}
            sx={{
              p: 4,
              maxWidth: 450,
              width: '100%',
              borderRadius: 4,
              boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #000000ff 0%, #000000ff 100%)',
                  mb: 2,
                }}
              >
                <LockIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Officer Login
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in with your NIC number
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="NIC Number"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your NIC number"
                value={nicNumber}
                onChange={(e) => setNicNumber(e.target.value)}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #461a1aff 0%, #2b1515ff 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign In'}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Use your registered NIC number to login
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
