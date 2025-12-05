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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Avatar,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Home as HomeIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getReceivers, createReceiver, updateReceiver, deleteReceiver } from '../utils/api';
import toast from 'react-hot-toast';

const Receivers = () => {
    const [receivers, setReceivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingReceiver, setEditingReceiver] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        latitude: '',
        longitude: '',
        address: '',
    });

    useEffect(() => {
        fetchReceivers();
    }, []);

    const fetchReceivers = async () => {
        setLoading(true);
        try {
            const data = await getReceivers();
            setReceivers(data);
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch receivers');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (receiver = null) => {
        if (receiver) {
            setEditingReceiver(receiver);
            setFormData({
                name: receiver.name,
                latitude: receiver.latitude,
                longitude: receiver.longitude,
                address: receiver.address,
            });
        } else {
            setEditingReceiver(null);
            setFormData({
                name: '',
                latitude: '',
                longitude: '',
                address: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingReceiver(null);
        setFormData({
            name: '',
            latitude: '',
            longitude: '',
            address: '',
        });
    };

    const handleSubmit = async () => {
        try {
            if (!formData.name) {
                toast.error('Name is required');
                return;
            }

            const receiverData = {
                name: formData.name,
                latitude: parseFloat(formData.latitude) || 0,
                longitude: parseFloat(formData.longitude) || 0,
                address: formData.address,
            };

            if (editingReceiver) {
                await updateReceiver(editingReceiver.receiverId, {
                    name: formData.name,
                    latitude: parseFloat(formData.latitude) || 0,
                    longitude: parseFloat(formData.longitude) || 0,
                    address: formData.address,
                });
                toast.success('Receiver updated successfully!');
            } else {
                await createReceiver(receiverData);
                toast.success('Receiver created successfully!');
            }

            handleCloseDialog();
            fetchReceivers();
        } catch (error) {
            toast.error(error.response?.data || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this receiver?')) {
            try {
                await deleteReceiver(id);
                toast.success('Receiver deleted successfully!');
                fetchReceivers();
            } catch (error) {
                toast.error('Failed to delete receiver');
            }
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 1: return 'error';
            case 2: return 'warning';
            case 3: return 'info';
            default: return 'default';
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 1: return 'High';
            case 2: return 'Medium';
            case 3: return 'Low';
            case 4: return 'Very Low';
            case 5: return 'Lowest';
            default: return `Priority ${priority}`;
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
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: 3,
                p: 4,
                mb: 4,
                color: 'white'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                            <HomeIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">Receivers</Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                                Manage receiver locations and delivery priorities
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
                        Add Receiver
                    </Button>
                </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                Showing {receivers.length} registered receivers. Click on a name to view details.
            </Alert>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Address</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Latitude</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Longitude</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created At</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {receivers.map((receiver) => (
                                <TableRow key={receiver.receiverId} hover>
                                    <TableCell>{receiver.receiverId}</TableCell>
                                    <TableCell>
                                        <Link 
                                        to={`/receiver/${receiver.receiverId}`} 
                                        style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 600 }}
                                    >
                                        {receiver.name}
                                    </Link>
                                </TableCell>
                                <TableCell>{receiver.address || '-'}</TableCell>
                                <TableCell>{receiver.latitude?.toFixed(4) || '-'}</TableCell>
                                <TableCell>{receiver.longitude?.toFixed(4) || '-'}</TableCell>
                                <TableCell>
                                    {receiver.createdAt ? new Date(receiver.createdAt).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(receiver)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(receiver.receiverId)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {receivers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography color="text.secondary" sx={{ py: 3 }}>
                                        No receivers found. Click "Add Receiver" to create one.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            </Paper>

            {/* Add/Edit Receiver Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
                    {editingReceiver ? 'Edit Receiver' : 'Add New Receiver'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={3}>
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
                                label="Address"
                                multiline
                                rows={2}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Latitude"
                                type="number"
                                value={formData.latitude}
                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                placeholder="e.g., 6.9271"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Longitude"
                                type="number"
                                value={formData.longitude}
                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                placeholder="e.g., 79.8612"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingReceiver ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Receivers;
