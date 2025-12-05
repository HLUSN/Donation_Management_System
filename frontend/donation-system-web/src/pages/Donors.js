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
    Alert,
    CircularProgress,
    Chip,
    Grid,
    Avatar,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    People as PeopleIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getDonors, createDonor, updateDonor, deleteDonor } from '../utils/api';
import toast from 'react-hot-toast';

const Donors = () => {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingDonor, setEditingDonor] = useState(null);
    
    const [formData, setFormData] = useState({
        nicNumber: '',
        name: '',
        phoneNumber: '',
        address: '',
    });

    useEffect(() => {
        fetchDonors();
    }, []);

    const fetchDonors = async () => {
        setLoading(true);
        try {
            const data = await getDonors();
            setDonors(data);
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch donors');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (donor = null) => {
        if (donor) {
            setEditingDonor(donor);
            setFormData({
                nicNumber: donor.nicNumber,
                name: donor.name,
                phoneNumber: donor.phoneNumber,
                address: donor.address,
            });
        } else {
            setEditingDonor(null);
            setFormData({
                nicNumber: '',
                name: '',
                phoneNumber: '',
                address: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingDonor(null);
        setFormData({
            nicNumber: '',
            name: '',
            phoneNumber: '',
            address: '',
        });
    };

    const handleSubmit = async () => {
        try {
            if (!formData.nicNumber || !formData.name) {
                toast.error('NIC Number and Name are required');
                return;
            }

            if (editingDonor) {
                await updateDonor(editingDonor.donorId, {
                    name: formData.name,
                    phoneNumber: formData.phoneNumber,
                    address: formData.address,
                });
                toast.success('Donor updated successfully!');
            } else {
                await createDonor(formData);
                toast.success('Donor created successfully!');
            }

            handleCloseDialog();
            fetchDonors();
        } catch (error) {
            toast.error(error.response?.data || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this donor?')) {
            try {
                await deleteDonor(id);
                toast.success('Donor deleted successfully!');
                fetchDonors();
            } catch (error) {
                toast.error('Failed to delete donor');
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">Error: {error}</Alert>;
    }

    return (
        <Box>
            {/* Beautiful Header */}
            <Box sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 3,
                p: 4,
                mb: 4,
                color: 'white'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                            <PeopleIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">Donors</Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                                Manage donor information and track contributions
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
                        Add Donor
                    </Button>
                </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                Showing {donors.length} registered donors. Click on a name to view details.
            </Alert>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <TableContainer>
                    <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>NIC Number</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone Number</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Address</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {donors.map((donor) => (
                            <TableRow key={donor.donorId} hover>
                                <TableCell>{donor.donorId}</TableCell>
                                <TableCell>
                                    <Link 
                                        to={`/donor/${donor.donorId}`} 
                                        style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 600 }}
                                    >
                                        {donor.name}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Chip label={donor.nicNumber} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>{donor.phoneNumber || '-'}</TableCell>
                                <TableCell>{donor.address || '-'}</TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(donor)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(donor.donorId)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {donors.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography color="text.secondary" sx={{ py: 3 }}>
                                        No donors found. Click "Add Donor" to create one.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            </Paper>

            {/* Add/Edit Donor Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
                    {editingDonor ? 'Edit Donor' : 'Add New Donor'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                label="NIC Number *"
                                value={formData.nicNumber}
                                onChange={(e) => setFormData({ ...formData, nicNumber: e.target.value })}
                                disabled={!!editingDonor}
                                placeholder="e.g., 123456789V"
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                label="Name *"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                label="Address"
                                multiline
                                rows={2}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingDonor ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Donors;
