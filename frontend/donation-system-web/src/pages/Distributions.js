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
    CircularProgress,
    Grid,
    Avatar,
    Autocomplete,
    ListItemText,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { 
    getDistributions, 
    createDistribution, 
    deleteDistribution,
    getOfficers,
    getReceivers,
    getDonations,
    getDonors
} from '../utils/api';
import toast from 'react-hot-toast';

const Distributions = () => {
    const [distributions, setDistributions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [officers, setOfficers] = useState([]);
    const [receivers, setReceivers] = useState([]);
    const [donations, setDonations] = useState([]);
    
    // Support for multiple items - each item can be linked to a donation
    const [distributionItems, setDistributionItems] = useState([{ 
        itemName: '', 
        quantity: 1, 
        donationId: null,
        donorName: '' 
    }]);
    
    const [formData, setFormData] = useState({
        officerId: '',
        receiverId: '',
        givenDate: new Date().toISOString().split('T')[0],
        complaint: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [distData, officerData, receiverData, donationData, donorData] = await Promise.all([
                getDistributions(),
                getOfficers(),
                getReceivers(),
                getDonations(),
                getDonors()
            ]);
            setDistributions(distData);
            setOfficers(officerData);
            setReceivers(receiverData);
            // Map donations with donor info and filter only available ones (quantity > 0)
            const donationsWithDonor = donationData
                .filter(d => d.quantity > 0) // Only show donations with available quantity
                .map(d => {
                    const donor = donorData.find(don => don.donorId === d.donorId);
                    return {
                        ...d,
                        donorName: donor?.name || 'Unknown Donor'
                    };
                });
            setDonations(donationsWithDonor);
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = () => {
        setDistributionItems([{ itemName: '', quantity: 1, donationId: null, donorName: '' }]);
        setFormData({
            officerId: '',
            receiverId: '',
            givenDate: new Date().toISOString().split('T')[0],
            complaint: '',
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setDistributionItems([{ itemName: '', quantity: 1, donationId: null, donorName: '' }]);
    };

    // Item management functions
    const addItem = () => {
        setDistributionItems([...distributionItems, { itemName: '', quantity: 1, donationId: null, donorName: '' }]);
    };

    const removeItem = (index) => {
        if (distributionItems.length > 1) {
            setDistributionItems(distributionItems.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...distributionItems];
        newItems[index][field] = value;
        setDistributionItems(newItems);
    };

    // Handle donation selection - auto-fill item name, quantity and donor
    const handleDonationSelect = (index, donation) => {
        const newItems = [...distributionItems];
        if (donation) {
            newItems[index] = {
                itemName: donation.itemName,
                quantity: donation.quantity,
                donationId: donation.donationId,
                donorName: donation.donorName || 'Unknown Donor'
            };
        } else {
            newItems[index] = { itemName: '', quantity: 1, donationId: null, donorName: '' };
        }
        setDistributionItems(newItems);
    };

    const handleSubmit = async () => {
        try {
            // Validate items
            const validItems = distributionItems.filter(item => item.itemName.trim() && item.quantity > 0);
            if (validItems.length === 0) {
                toast.error('Please add at least one item with name and quantity');
                return;
            }

            if (!formData.officerId || !formData.receiverId) {
                toast.error('Please select officer and receiver');
                return;
            }

            // Create distribution for each item
            for (const item of validItems) {
                const distributionData = {
                    donationId: item.donationId || null,
                    officerId: parseInt(formData.officerId),
                    receiverId: parseInt(formData.receiverId),
                    itemName: item.itemName,
                    itemId: null,
                    quantity: parseInt(item.quantity),
                    givenDate: new Date(formData.givenDate).toISOString(),
                    complaint: formData.complaint || null,
                };

                await createDistribution(distributionData);
            }
            
            toast.success(`${validItems.length} distribution(s) created successfully!`);
            handleCloseDialog();
            fetchData();
        } catch (error) {
            console.error('Error creating distribution:', error);
            toast.error(error.response?.data || 'Failed to create distribution');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this distribution?')) {
            try {
                await deleteDistribution(id);
                toast.success('Distribution deleted successfully!');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete distribution');
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
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                borderRadius: 3,
                p: 4,
                mb: 4,
                color: 'white'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                            <ShippingIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">Distributions</Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                                Track and manage item distributions to receivers
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                        sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                            fontWeight: 'bold',
                            px: 3
                        }}
                    >
                        Add Distribution
                    </Button>
                </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                Showing {distributions.length} distributions. Manage all item distributions to receivers.
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
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Receiver</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Given Date</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Complaint</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {distributions.map((distribution) => (
                                <TableRow key={distribution.distributionId} hover>
                                    <TableCell>{distribution.distributionId}</TableCell>
                                    <TableCell>
                                        <Typography fontWeight="medium">{distribution.itemName}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={distribution.quantity} 
                                        color={distribution.quantity > 100 ? 'success' : distribution.quantity > 50 ? 'warning' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Link 
                                        to={`/officer/${distribution.officerId}`} 
                                        style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}
                                    >
                                        {distribution.officerName || 'Unknown'}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Link 
                                        to={`/receiver/${distribution.receiverId}`} 
                                        style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}
                                    >
                                        {distribution.receiverName || 'Unknown'}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {new Date(distribution.givenDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {distribution.complaint ? (
                                        <Chip label="Has Complaint" color="error" size="small" />
                                    ) : (
                                        <Chip label="None" color="success" size="small" variant="outlined" />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(distribution.distributionId)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {distributions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography color="text.secondary" sx={{ py: 3 }}>
                                        No distributions found. Click "Add Distribution" to create one.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            </Paper>

            {/* Add Distribution Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
                    Add New Distribution
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Officer *</InputLabel>
                                <Select
                                    value={formData.officerId}
                                    label="Officer *"
                                    onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
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
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Receiver *</InputLabel>
                                <Select
                                    value={formData.receiverId}
                                    label="Receiver *"
                                    onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
                                >
                                    <MenuItem value="">Select Receiver</MenuItem>
                                    {receivers.map((receiver) => (
                                        <MenuItem key={receiver.receiverId} value={receiver.receiverId}>
                                            {receiver.name} - {receiver.address}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Items Section */}
                        <Grid size={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Distribution Items ({distributionItems.length})
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={addItem}
                                    variant="outlined"
                                >
                                    Add Item
                                </Button>
                            </Box>
                            
                            {distributionItems.map((item, index) => (
                                <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid size={{ xs: 12, sm: 5 }}>
                                            <Autocomplete
                                                freeSolo
                                                options={donations}
                                                getOptionLabel={(option) => {
                                                    if (typeof option === 'string') return option;
                                                    return option.itemName;
                                                }}
                                                value={donations.find(d => d.donationId === item.donationId) || item.itemName}
                                                onChange={(_, newValue) => {
                                                    if (typeof newValue === 'string') {
                                                        updateItem(index, 'itemName', newValue);
                                                        updateItem(index, 'donationId', null);
                                                        updateItem(index, 'donorName', '');
                                                    } else if (newValue) {
                                                        handleDonationSelect(index, newValue);
                                                    } else {
                                                        updateItem(index, 'itemName', '');
                                                        updateItem(index, 'donationId', null);
                                                        updateItem(index, 'donorName', '');
                                                    }
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Item Name *"
                                                        size="small"
                                                        placeholder="Select item or type new"
                                                    />
                                                )}
                                                renderOption={(props, option) => (
                                                    <li {...props} key={option.donationId}>
                                                        <ListItemText
                                                            primary={option.itemName}
                                                            secondary={`Qty: ${option.quantity} | Donor: ${option.donorName}`}
                                                        />
                                                    </li>
                                                )}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 3 }}>
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
                                        <Grid size={{ xs: 12, sm: 3 }}>
                                            <TextField
                                                fullWidth
                                                label="Donor"
                                                value={item.donorName}
                                                size="small"
                                                disabled
                                                sx={{ bgcolor: item.donorName ? 'success.50' : 'transparent' }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 1 }}>
                                            {distributionItems.length > 1 && (
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
                                label="Given Date"
                                type="date"
                                value={formData.givenDate}
                                onChange={(e) => setFormData({ ...formData, givenDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            {/* Empty space or additional field */}
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                label="Complaint (Optional)"
                                multiline
                                rows={3}
                                value={formData.complaint}
                                onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                                placeholder="Enter any complaints or issues..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Create Distribution
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Distributions;
