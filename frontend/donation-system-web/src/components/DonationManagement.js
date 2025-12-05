import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Grid,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  PersonAdd as PersonAddIcon,
  VolunteerActivism as DonationIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { 
  getDonations, 
  createDonation, 
  updateDonation, 
  deleteDonation,
  getDonors,
  getOfficers
} from '../utils/api';
import toast from 'react-hot-toast';

const DonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donorTab, setDonorTab] = useState(0); // 0 = existing, 1 = new
  
  // Support for multiple items
  const [donationItems, setDonationItems] = useState([{ itemName: '', quantity: 1 }]);
  
  const [formData, setFormData] = useState({
    officerId: '',
    donorId: '',
    donatedDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
  });

  const [newDonorData, setNewDonorData] = useState({
    nicNumber: '',
    name: '',
    phoneNumber: '',
    address: '',
  });

  const [officers, setOfficers] = useState([]);
  const [donors, setDonors] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [donationsData, officersData, donorsData] = await Promise.all([
        getDonations(),
        getOfficers(),
        getDonors()
      ]);
      setDonations(donationsData);
      setOfficers(officersData);
      setDonors(donorsData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (donation = null) => {
    if (donation) {
      setEditingDonation(donation);
      setDonationItems([{ itemName: donation.itemName, quantity: donation.quantity }]);
      setFormData({
        officerId: donation.officerId,
        donorId: donation.donorId,
        donatedDate: donation.donatedDate ? donation.donatedDate.split('T')[0] : new Date().toISOString().split('T')[0],
        expiryDate: donation.expiryDate ? donation.expiryDate.split('T')[0] : '',
      });
      setDonorTab(0);
    } else {
      setEditingDonation(null);
      setDonationItems([{ itemName: '', quantity: 1 }]);
      setFormData({
        officerId: '',
        donorId: '',
        donatedDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
      });
      setNewDonorData({
        nicNumber: '',
        name: '',
        phoneNumber: '',
        address: '',
      });
      setDonorTab(0);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDonation(null);
    setDonationItems([{ itemName: '', quantity: 1 }]);
    setFormData({
      officerId: '',
      donorId: '',
      donatedDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
    });
    setNewDonorData({
      nicNumber: '',
      name: '',
      phoneNumber: '',
      address: '',
    });
    setDonorTab(0);
  };

  // Item management functions
  const addItem = () => {
    setDonationItems([...donationItems, { itemName: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (donationItems.length > 1) {
      setDonationItems(donationItems.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...donationItems];
    newItems[index][field] = value;
    setDonationItems(newItems);
  };

  const handleSubmit = async () => {
    try {
      // Validate items
      const validItems = donationItems.filter(item => item.itemName.trim() && item.quantity > 0);
      if (validItems.length === 0) {
        toast.error('Please add at least one item with name and quantity');
        return;
      }

      if (!formData.officerId) {
        toast.error('Please select an officer');
        return;
      }

      // Validate donor info based on tab
      if (donorTab === 0 && !formData.donorId) {
        toast.error('Please select a donor');
        return;
      }

      if (donorTab === 1) {
        if (!newDonorData.nicNumber || !newDonorData.name) {
          toast.error('Please fill donor NIC number and name');
          return;
        }
      }

      if (editingDonation) {
        // Update existing donation (only first item for editing)
        await updateDonation(editingDonation.donationId, {
          itemName: donationItems[0].itemName,
          quantity: parseInt(donationItems[0].quantity),
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        });
        toast.success('Donation updated successfully!');
      } else {
        // Create new donations - one for each item
        for (const item of validItems) {
          const donationData = {
            itemName: item.itemName,
            quantity: parseInt(item.quantity),
            officerId: parseInt(formData.officerId),
            donatedDate: new Date(formData.donatedDate).toISOString(),
            expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
          };

          // Add donor info based on tab
          if (donorTab === 0) {
            donationData.donorId = parseInt(formData.donorId);
          } else {
            donationData.newDonor = {
              nicNumber: newDonorData.nicNumber,
              name: newDonorData.name,
              phoneNumber: newDonorData.phoneNumber || '',
              address: newDonorData.address || '',
            };
          }

          console.log('Sending donation data:', donationData);

          await createDonation(donationData);
        }
        toast.success(`${validItems.length} donation(s) created successfully!`);
      }

      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = typeof error.response?.data === 'string' 
        ? error.response.data 
        : error.response?.data?.message || error.response?.data?.errors?.join(', ') || 'Operation failed';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await deleteDonation(id);
        toast.success('Donation deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete donation');
      }
    }
  };

  const getStatusColor = (quantity) => {
    if (quantity > 200) return 'success';
    if (quantity > 100) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Beautiful Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        borderRadius: 3,
        p: 4,
        mb: 4,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <DonationIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">Donation Management</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                Track donations and manage donor contributions
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              fontWeight: 'bold',
              px: 3
            }}
          >
            Add Donation
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Showing {donations.length} donations. Use the table below to manage donations.
      </Alert>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Item Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quantity</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Officer</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Donor</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
          </TableHead>
          <TableBody>
            {donations.map((donation) => (
              <TableRow key={donation.donationId}>
                <TableCell>{donation.donationId}</TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {donation.itemName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={donation.quantity}
                    color={getStatusColor(donation.quantity)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Link to={`/officer/${donation.officerId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {donation.officerName}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/donor/${donation.donorId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {donation.donorName}
                  </Link>
                </TableCell>
                <TableCell>
                  {new Date(donation.donatedDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(donation)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(donation.donationId)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton size="small" color="info">
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </Paper>

      {/* Donation Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
          {editingDonation ? 'Edit Donation' : 'Add New Donation'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {/* Items Section */}
            <Grid size={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Donation Items ({donationItems.length})
                </Typography>
                {!editingDonation && (
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={addItem}
                    variant="outlined"
                  >
                    Add Item
                  </Button>
                )}
              </Box>
              
              {donationItems.map((item, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label={`Item ${index + 1} Name *`}
                        value={item.itemName}
                        onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        label="Quantity *"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        InputProps={{ inputProps: { min: 1 } }}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                      {donationItems.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => removeItem(index)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Donated Date"
                type="date"
                value={formData.donatedDate}
                onChange={(e) => setFormData({ ...formData, donatedDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Expiry Date (Optional)"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Officer *</InputLabel>
                <Select
                  value={formData.officerId}
                  label="Officer *"
                  onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
                  disabled={!!editingDonation}
                >
                  <MenuItem value="">Select Officer</MenuItem>
                  {officers.map((officer) => (
                    <MenuItem key={officer.officerId} value={officer.officerId}>
                      {officer.name} - {officer.officeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Donor Section */}
            {!editingDonation && (
              <>
                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Donor Information
                  </Typography>
                  <Tabs 
                    value={donorTab} 
                    onChange={(e, newValue) => setDonorTab(newValue)}
                    sx={{ mb: 2 }}
                  >
                    <Tab label="Select Existing Donor" />
                    <Tab label="Add New Donor" icon={<PersonAddIcon />} iconPosition="start" />
                  </Tabs>
                </Grid>

                {donorTab === 0 ? (
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <InputLabel>Donor *</InputLabel>
                      <Select
                        value={formData.donorId}
                        label="Donor *"
                        onChange={(e) => setFormData({ ...formData, donorId: e.target.value })}
                      >
                        <MenuItem value="">Select Donor</MenuItem>
                        {donors.map((donor) => (
                          <MenuItem key={donor.donorId} value={donor.donorId}>
                            {donor.name} ({donor.nicNumber})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                ) : (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="NIC Number *"
                        value={newDonorData.nicNumber}
                        onChange={(e) => setNewDonorData({ ...newDonorData, nicNumber: e.target.value })}
                        placeholder="e.g., 123456789V"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Donor Name *"
                        value={newDonorData.name}
                        onChange={(e) => setNewDonorData({ ...newDonorData, name: e.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={newDonorData.phoneNumber}
                        onChange={(e) => setNewDonorData({ ...newDonorData, phoneNumber: e.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Address"
                        value={newDonorData.address}
                        onChange={(e) => setNewDonorData({ ...newDonorData, address: e.target.value })}
                      />
                    </Grid>
                  </>
                )}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDonation ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DonationManagement;