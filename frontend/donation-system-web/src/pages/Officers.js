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
    Badge as BadgeIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getOfficers, createOfficer, updateOfficer, deleteOfficer } from '../utils/api';
import toast from 'react-hot-toast';

const Officers = () => {
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingOfficer, setEditingOfficer] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        post: '',
        officeName: '',
        address: '',
        phoneNumber: '',
        nicNumber: '',
    });

    useEffect(() => {
        fetchOfficers();
    }, []);

    const fetchOfficers = async () => {
        setLoading(true);
        try {
            const data = await getOfficers();
            setOfficers(data);
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch officers');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (officer = null) => {
        if (officer) {
            setEditingOfficer(officer);
            setFormData({
                name: officer.name,
                post: officer.post,
                officeName: officer.officeName,
                address: officer.address,
                phoneNumber: officer.phoneNumber,
                nicNumber: officer.nicNumber,
            });
        } else {
            setEditingOfficer(null);
            setFormData({
                name: '',
                post: '',
                officeName: '',
                address: '',
                phoneNumber: '',
                nicNumber: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingOfficer(null);
        setFormData({
            name: '',
            post: '',
            officeName: '',
            address: '',
            phoneNumber: '',
            nicNumber: '',
        });
    };

    const handleSubmit = async () => {
        try {
            if (!formData.name || !formData.nicNumber) {
                toast.error('Name and NIC Number are required');
                return;
            }

            if (editingOfficer) {
                await updateOfficer(editingOfficer.officerId, formData);
                toast.success('Officer updated successfully!');
            } else {
                await createOfficer(formData);
                toast.success('Officer created successfully!');
            }

            handleCloseDialog();
            fetchOfficers();
        } catch (error) {
            toast.error(error.response?.data || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this officer?')) {
            try {
                await deleteOfficer(id);
                toast.success('Officer deleted successfully!');
                fetchOfficers();
            } catch (error) {
                toast.error('Failed to delete officer');
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
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                borderRadius: 3,
                p: 4,
                mb: 4,
                color: 'white'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                            <BadgeIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">Officers</Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                                Manage officer information and assignments
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
                        Add Officer
                    </Button>
                </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                Showing {officers.length} registered officers. Click on a name to view details.
            </Alert>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Post</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Office Name</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>NIC Number</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone Number</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Address</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {officers.map((officer) => (
                            <TableRow key={officer.officerId} hover>
                                <TableCell>{officer.officerId}</TableCell>
                                <TableCell>
                                    <Link 
                                        to={`/officer/${officer.officerId}`} 
                                        style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 600 }}
                                    >
                                        {officer.name}
                                    </Link>
                                </TableCell>
                                <TableCell>{officer.post || '-'}</TableCell>
                                <TableCell>{officer.officeName || '-'}</TableCell>
                                <TableCell>
                                    <Chip label={officer.nicNumber} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>{officer.phoneNumber || '-'}</TableCell>
                                <TableCell>{officer.address || '-'}</TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(officer)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(officer.officerId)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {officers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography color="text.secondary" sx={{ py: 3 }}>
                                        No officers found. Click "Add Officer" to create one.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            </Paper>

            {/* Add/Edit Officer Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
                    {editingOfficer ? 'Edit Officer' : 'Add New Officer'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Name *"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="NIC Number *"
                                value={formData.nicNumber}
                                onChange={(e) => setFormData({ ...formData, nicNumber: e.target.value })}
                                disabled={!!editingOfficer}
                                placeholder="e.g., 123456789V"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Post"
                                value={formData.post}
                                onChange={(e) => setFormData({ ...formData, post: e.target.value })}
                                placeholder="e.g., Distribution Officer"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Office Name"
                                value={formData.officeName}
                                onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                                placeholder="e.g., Colombo Main Office"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingOfficer ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Officers;
