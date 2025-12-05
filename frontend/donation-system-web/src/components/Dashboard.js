import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  LocalShipping as DeliveryIcon,
  VolunteerActivism as DonationIcon,
  People as PeopleIcon,
  Route as RouteIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  PersonAdd as PersonAddIcon,
  CardGiftcard as GiftIcon,
  Inventory as InventoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart 
} from 'recharts';
import { Link } from 'react-router-dom';
import { getDonations, getDistributions, getDonors, getOfficers, getReceivers, getRoutes, deleteRoute } from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalDistributions: 0,
    activeOfficers: 0,
    totalReceivers: 0,
    totalDonors: 0,
  });

  const [recentDonations, setRecentDonations] = useState([]);
  const [recentRoutes, setRecentRoutes] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [editedDistance, setEditedDistance] = useState('');

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [donations, distributions, donors, officers, receivers, routes] = await Promise.all([
        getDonations().catch(() => []),
        getDistributions().catch(() => []),
        getDonors().catch(() => []),
        getOfficers().catch(() => []),
        getReceivers().catch(() => []),
        getRoutes().catch(() => []),
      ]);

      setStats({
        totalDonations: donations.length,
        totalDistributions: distributions.length,
        activeOfficers: officers.length,
        totalReceivers: receivers.length,
        totalDonors: donors.length,
      });

      // Set recent donations (last 5)
      const sortedDonations = [...donations].sort((a, b) => 
        new Date(b.donatedDate) - new Date(a.donatedDate)
      ).slice(0, 5);
      setRecentDonations(sortedDonations);

      // Set recent routes (last 10)
      const sortedRoutes = [...routes].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      ).slice(0, 10);
      setRecentRoutes(sortedRoutes);

      // Create distribution chart data by month
      const monthlyData = getMonthlyDistributionData(distributions);
      setDistributionData(monthlyData);

      // Create pie chart data for item distribution
      const itemData = getItemDistributionData(donations);
      setPieData(itemData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleEditRoute = (route) => {
    setSelectedRoute(route);
    setEditedDistance(route.distance?.toString() || '');
    setEditDialogOpen(true);
  };

  const handleUpdateRoute = async () => {
    try {
      const response = await fetch(`http://localhost:5016/api/route/${selectedRoute.routeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedRoute,
          distance: parseFloat(editedDistance),
        }),
      });

      if (response.ok) {
        toast.success('Route updated successfully');
        setEditDialogOpen(false);
        fetchDashboardData();
      } else {
        toast.error('Failed to update route');
      }
    } catch (error) {
      console.error('Error updating route:', error);
      toast.error('Failed to update route');
    }
  };

  const handleDeleteRoute = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await deleteRoute(routeId);
        toast.success('Route deleted successfully');
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting route:', error);
        toast.error('Failed to delete route');
      }
    }
  };

  const getMonthlyDistributionData = (distributions) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Get last 6 months
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const count = distributions.filter(d => {
        const date = new Date(d.givenDate);
        return date.getMonth() === monthIndex;
      }).length;
      data.push({ month: months[monthIndex], deliveries: count });
    }
    return data;
  };

  const getItemDistributionData = (donations) => {
    const itemCounts = {};
    donations.forEach(d => {
      itemCounts[d.itemName] = (itemCounts[d.itemName] || 0) + d.quantity;
    });
    
    return Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend, trendUp, linkTo }) => (
    <Card 
      sx={{ 
        height: '100%',
        minHeight: 160,
        background: `linear-gradient(145deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
        color: '#fff',
        borderRadius: 3,
        boxShadow: `0 4px 20px ${alpha(color, 0.4)}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 30px ${alpha(color, 0.5)}`,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.85)', 
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.75rem',
                mb: 1
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                color: '#fff',
                lineHeight: 1.2
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                {trendUp ? (
                  <ArrowUpIcon sx={{ color: '#a7f3d0', fontSize: 18 }} />
                ) : (
                  <ArrowDownIcon sx={{ color: '#fecaca', fontSize: 18 }} />
                )}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: trendUp ? '#a7f3d0' : '#fecaca', 
                    fontWeight: 500,
                    fontSize: '0.8rem'
                  }}
                >
                  {trend}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: '#fff',
              width: 52,
              height: 52,
              backdropFilter: 'blur(10px)'
            }}
          >
            {icon}
          </Avatar>
        </Box>
        {linkTo && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Typography 
              component={Link} 
              to={linkTo} 
              variant="body2" 
              sx={{ 
                color: '#fff', 
                textDecoration: 'none',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': { 
                  color: 'rgba(255,255,255,0.9)',
                  gap: 1
                },
                transition: 'all 0.2s'
              }}
            >
              View Details →
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
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
          color: '#fff'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Welcome back! Here's an overview of your donation system.
            </Typography>
          </Box>
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={fetchDashboardData} 
              disabled={loading}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard
            title="Total Donations"
            value={stats.totalDonations}
            icon={<DonationIcon />}
            color="#3b82f6"
            linkTo="/donations"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard
            title="Distributions"
            value={stats.totalDistributions}
            icon={<DeliveryIcon />}
            color="#8b5cf6"
            linkTo="/distributions"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard
            title="Officers"
            value={stats.activeOfficers}
            icon={<PeopleIcon />}
            color="#10b981"
            linkTo="/officers"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard
            title="Receivers"
            value={stats.totalReceivers}
            icon={<InventoryIcon />}
            color="#f59e0b"
            linkTo="/receivers"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard
            title="Donors"
            value={stats.totalDonors}
            icon={<PersonAddIcon />}
            color="#ef4444"
            linkTo="/donors"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Distribution Trend Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper 
            sx={{ 
              p: 3, 
              minHeight: 420,
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Distribution Trend
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Monthly distribution overview for the last 6 months
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={distributionData}>
                <defs>
                  <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none',
                    borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="deliveries" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fill="url(#colorDeliveries)" 
                  name="Distributions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Item Distribution Pie Chart */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper 
            sx={{ 
              p: 3, 
              minHeight: 420,
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Top Donated Items
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Distribution by item type
            </Typography>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#888', strokeWidth: 1 }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <Typography color="text.secondary">No donation data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Donations */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, minHeight: 420, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Recent Donations
              </Typography>
              <Chip 
                label={`${recentDonations.length} items`}
                size="small"
                sx={{ 
                  bgcolor: alpha('#3b82f6', 0.1), 
                  color: '#3b82f6',
                  fontWeight: 600
                }}
              />
            </Box>
            <List sx={{ overflow: 'auto', maxHeight: 320 }}>
              {recentDonations.length > 0 ? (
                recentDonations.map((donation, index) => (
                  <React.Fragment key={donation.donationId}>
                    <ListItem 
                      sx={{ 
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: alpha(COLORS[index % COLORS.length], 0.05),
                        '&:hover': { bgcolor: alpha(COLORS[index % COLORS.length], 0.1) }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: COLORS[index % COLORS.length], width: 40, height: 40 }}>
                          <GiftIcon fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight="600">
                            {donation.itemName}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Qty: {donation.quantity} • By: {donation.donorName || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(donation.donatedDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip 
                        label={donation.quantity > 100 ? 'Large' : donation.quantity > 50 ? 'Medium' : 'Small'}
                        size="small"
                        sx={{
                          bgcolor: donation.quantity > 100 
                            ? alpha('#10b981', 0.1) 
                            : donation.quantity > 50 
                              ? alpha('#f59e0b', 0.1) 
                              : alpha('#6b7280', 0.1),
                          color: donation.quantity > 100 
                            ? '#10b981' 
                            : donation.quantity > 50 
                              ? '#f59e0b' 
                              : '#6b7280',
                          fontWeight: 500
                        }}
                      />
                    </ListItem>
                  </React.Fragment>
                ))
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography color="text.secondary">No recent donations</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions & System Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, minHeight: 420, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={6}>
                <Card 
                  component={Link}
                  to="/donations"
                  sx={{ 
                    p: 2.5, 
                    textAlign: 'center',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.2)',
                      borderColor: '#3b82f6'
                    }
                  }}
                >
                  <Avatar sx={{ bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6', mx: 'auto', mb: 1, width: 48, height: 48 }}>
                    <DonationIcon />
                  </Avatar>
                  <Typography variant="body2" fontWeight="600" color="text.primary">
                    Add Donation
                  </Typography>
                </Card>
              </Grid>
              <Grid size={6}>
                <Card 
                  component={Link}
                  to="/distributions"
                  sx={{ 
                    p: 2.5, 
                    textAlign: 'center',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(139, 92, 246, 0.2)',
                      borderColor: '#8b5cf6'
                    }
                  }}
                >
                  <Avatar sx={{ bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6', mx: 'auto', mb: 1, width: 48, height: 48 }}>
                    <DeliveryIcon />
                  </Avatar>
                  <Typography variant="body2" fontWeight="600" color="text.primary">
                    Add Distribution
                  </Typography>
                </Card>
              </Grid>
              <Grid size={6}>
                <Card 
                  component={Link}
                  to="/routes"
                  sx={{ 
                    p: 2.5, 
                    textAlign: 'center',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)',
                      borderColor: '#10b981'
                    }
                  }}
                >
                  <Avatar sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', mx: 'auto', mb: 1, width: 48, height: 48 }}>
                    <RouteIcon />
                  </Avatar>
                  <Typography variant="body2" fontWeight="600" color="text.primary">
                    Optimize Routes
                  </Typography>
                </Card>
              </Grid>
              <Grid size={6}>
                <Card 
                  component={Link}
                  to="/donors"
                  sx={{ 
                    p: 2.5, 
                    textAlign: 'center',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(239, 68, 68, 0.2)',
                      borderColor: '#ef4444'
                    }
                  }}
                >
                  <Avatar sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', mx: 'auto', mb: 1, width: 48, height: 48 }}>
                    <PersonAddIcon />
                  </Avatar>
                  <Typography variant="body2" fontWeight="600" color="text.primary">
                    Add Donor
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.secondary">
              System Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#10b981', 0.1) }}>
                  <CheckIcon sx={{ color: '#10b981', fontSize: 16 }} />
                </Avatar>
                <Typography variant="body2">Route optimization running optimally</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#10b981', 0.1) }}>
                  <CheckIcon sx={{ color: '#10b981', fontSize: 16 }} />
                </Avatar>
                <Typography variant="body2">Database connected</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#3b82f6', 0.1) }}>
                  <ScheduleIcon sx={{ color: '#3b82f6', fontSize: 16 }} />
                </Avatar>
                <Typography variant="body2">Last sync: Just now</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Route History Section */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Route History
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All completed route optimizations
                </Typography>
              </Box>
              <Chip 
                icon={<RouteIcon />} 
                label={`${recentRoutes.length} Routes`}
                color="primary"
                variant="outlined"
              />
            </Box>
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {recentRoutes.length > 0 ? (
                recentRoutes.map((route, index) => (
                  <React.Fragment key={route.routeId}>
                    <ListItem 
                      sx={{ 
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: alpha('#3b82f6', 0.03),
                        '&:hover': { bgcolor: alpha('#3b82f6', 0.08) }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: '#3b82f6', width: 40, height: 40 }}>
                          <RouteIcon fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight="600">
                            Distribution #{route.distributionId} → Receiver #{route.toReceiverId}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              From Officer #{route.fromOfficerId} • Distance: {route.distance?.toFixed(2)} km
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(route.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip 
                        label={route.distance > 20 ? 'Long' : route.distance > 10 ? 'Medium' : 'Short'}
                        size="small"
                        color={route.distance > 20 ? 'error' : route.distance > 10 ? 'warning' : 'success'}
                        variant="outlined"
                      />
                      <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEditRoute(route)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteRoute(route.routeId)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                    {index < recentRoutes.length - 1 && <Divider sx={{ my: 0.5 }} />}
                  </React.Fragment>
                ))
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <RouteIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography color="text.secondary">No routes found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Routes will appear here after optimization is completed
                    </Typography>
                  </Box>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Route Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Route</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Distribution #{selectedRoute?.distributionId} → Receiver #{selectedRoute?.toReceiverId}
            </Typography>
            <TextField
              label="Distance (km)"
              type="number"
              fullWidth
              value={editedDistance}
              onChange={(e) => setEditedDistance(e.target.value)}
              sx={{ mt: 2 }}
              inputProps={{ step: 0.01, min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateRoute} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;