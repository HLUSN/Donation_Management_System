import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  Grid,
  Divider,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Logout as LogoutIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const [officer, setOfficer] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedOfficer, setEditedOfficer] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const currentOfficer = localStorage.getItem('loggedInOfficer');
    if (!currentOfficer) {
      navigate('/login');
      return;
    }
    
    const officerData = JSON.parse(currentOfficer);
    setOfficer(officerData);
    setEditedOfficer(officerData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInOfficer');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5016/api/officer/${officer.officerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedOfficer),
      });

      if (response.ok) {
        const updatedOfficer = await response.json();
        setOfficer(updatedOfficer);
        localStorage.setItem('currentOfficer', JSON.stringify(updatedOfficer));
        toast.success('Profile updated successfully');
        setEditDialogOpen(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (!officer) {
    return null;
  }

  const InfoItem = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Avatar sx={{ bgcolor: '#667eea', mr: 2, width: 40, height: 40 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={500}>
          {value || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          color: '#fff',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '2rem',
                fontWeight: 'bold',
              }}
            >
              {officer.name?.charAt(0) || 'O'}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {officer.name}
              </Typography>
              <Chip
                label={officer.post || 'Officer'}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            >
              Edit Profile
            </Button>
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Profile Details */}
      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <InfoItem
                icon={<BadgeIcon fontSize="small" />}
                label="NIC Number"
                value={officer.nicNumber}
              />
              <InfoItem
                icon={<PhoneIcon fontSize="small" />}
                label="Phone Number"
                value={officer.phoneNumber}
              />
              <InfoItem
                icon={<WorkIcon fontSize="small" />}
                label="Position"
                value={officer.post}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Office Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Office Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <InfoItem
                icon={<BusinessIcon fontSize="small" />}
                label="Office Name"
                value={officer.officeName}
              />
              <InfoItem
                icon={<LocationIcon fontSize="small" />}
                label="Office Address"
                value={officer.address}
              />
              <InfoItem
                icon={<LocationIcon fontSize="small" />}
                label="Coordinates"
                value={officer.latitude && officer.longitude 
                  ? `${officer.latitude}, ${officer.longitude}` 
                  : 'Not set'}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Stats
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f0f9ff', textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {officer.officerId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Officer ID
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f0fdf4', textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      Active
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Account Status
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={editedOfficer.name || ''}
              onChange={(e) => setEditedOfficer({ ...editedOfficer, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={editedOfficer.phoneNumber || ''}
              onChange={(e) => setEditedOfficer({ ...editedOfficer, phoneNumber: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Position"
              value={editedOfficer.post || ''}
              onChange={(e) => setEditedOfficer({ ...editedOfficer, post: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Office Name"
              value={editedOfficer.officeName || ''}
              onChange={(e) => setEditedOfficer({ ...editedOfficer, officeName: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Office Address"
              multiline
              rows={2}
              value={editedOfficer.address || ''}
              onChange={(e) => setEditedOfficer({ ...editedOfficer, address: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  type="number"
                  value={editedOfficer.latitude || ''}
                  onChange={(e) => setEditedOfficer({ ...editedOfficer, latitude: parseFloat(e.target.value) })}
                  inputProps={{ step: 0.0001 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  type="number"
                  value={editedOfficer.longitude || ''}
                  onChange={(e) => setEditedOfficer({ ...editedOfficer, longitude: parseFloat(e.target.value) })}
                  inputProps={{ step: 0.0001 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
