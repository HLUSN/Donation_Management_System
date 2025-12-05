import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Chip,
  alpha,
  Divider,
  Avatar,
  Checkbox,
  ListItemIcon,
  ListItemButton,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  LocalGasStation as FuelIcon,
  DirectionsCar as CarIcon,
  MyLocation as MyLocationIcon,
  Flag as FlagIcon,
  Route as RouteIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getOfficers, getReceivers, getDistributions } from '../utils/api';
import toast from 'react-hot-toast';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      <span style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 12px;">${label}</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const startIcon = createCustomIcon('#22c55e', 'S');  // Green for start
const endIcon = createCustomIcon('#ef4444', 'E');    // Red for end

// Map center controller component
const MapCenterController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 10, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

const RouteOptimization = () => {
  const [officers, setOfficers] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [selectedDistributions, setSelectedDistributions] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]); // Default to Colombo, Sri Lanka
  const [mapZoom, setMapZoom] = useState(8);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [officersData, receiversData, distributionsData] = await Promise.all([
        getOfficers().catch(() => []),
        getReceivers().catch(() => []),
        getDistributions().catch(() => []),
      ]);
      setOfficers(officersData);

      // Map distributions with receiver location info
      const distributionsWithLocation = distributionsData.map(dist => {
        const receiver = receiversData.find(r => r.receiverId === dist.receiverId);
        return {
          ...dist,
          receiverName: dist.receiverName || receiver?.name || 'Unknown Receiver',
          latitude: receiver?.latitude || null,
          longitude: receiver?.longitude || null,
          address: receiver?.address || '',
          priority: receiver?.priority || 5,
        };
      }).filter(d => d.latitude && d.longitude);
      
      setDistributions(distributionsWithLocation);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setDataLoading(false);
    }
  };

  const calculateOptimalRoute = async () => {
    if (!selectedOfficer) {
      toast.error('Please select a starting officer');
      return;
    }

    if (selectedDistributions.length === 0) {
      toast.error('Please select at least one distribution');
      return;
    }

    setLoading(true);
    try {
      const officer = officers.find(o => o.officerId === selectedOfficer);
      
      const selectedDistributionItems = distributions.filter(d => selectedDistributions.includes(d.distributionId));
      
      // Starting point
      const startPoint = { 
        id: officer.officerId, 
        name: officer.name || officer.officeName, 
        latitude: officer.latitude || 6.9271, 
        longitude: officer.longitude || 79.8612, 
        type: 'Officer' 
      };

      // Convert distributions to points
      const unvisitedPoints = selectedDistributionItems.map(d => ({
        id: d.distributionId,
        name: `${d.itemName} → ${d.receiverName}`,
        latitude: d.latitude,
        longitude: d.longitude,
        type: 'Distribution',
        itemName: d.itemName,
        quantity: d.quantity,
        address: d.address,
        receiverId: d.receiverId,
      }));

      // Nearest Neighbor Algorithm for optimal route
      const optimizedPath = [startPoint];
      let currentPoint = startPoint;
      const remaining = [...unvisitedPoints];

      while (remaining.length > 0) {
        let nearestIndex = 0;
        let shortestDistance = calculateDistance(
          currentPoint.latitude, currentPoint.longitude,
          remaining[0].latitude, remaining[0].longitude
        );

        // Find nearest unvisited point
        for (let i = 1; i < remaining.length; i++) {
          const dist = calculateDistance(
            currentPoint.latitude, currentPoint.longitude,
            remaining[i].latitude, remaining[i].longitude
          );
          if (dist < shortestDistance) {
            shortestDistance = dist;
            nearestIndex = i;
          }
        }

        // Visit the nearest point
        currentPoint = remaining[nearestIndex];
        optimizedPath.push(currentPoint);
        remaining.splice(nearestIndex, 1);
      }

      // Calculate total distance
      let totalDistance = 0;
      for (let i = 1; i < optimizedPath.length; i++) {
        const dist = calculateDistance(
          optimizedPath[i-1].latitude, optimizedPath[i-1].longitude,
          optimizedPath[i].latitude, optimizedPath[i].longitude
        );
        totalDistance += dist;
      }

      const mockRouteResponse = {
        path: optimizedPath,
        totalDistance: totalDistance.toFixed(2),
        estimatedTime: (totalDistance * 2).toFixed(1), // Rough estimate: 2 min per km
        fuelCost: (totalDistance * 0.15).toFixed(2), // Rough estimate: $0.15 per km
        directions: optimizedPath.slice(1).map((p, i) =>
          `${i + 1}. Visit ${p.name} at ${p.address || 'Address N/A'}`
        ),
      };

      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRouteData(mockRouteResponse);
      setIsConfirmed(false); // Reset confirmation status
      
      // Calculate bounds to fit all route points
      if (optimizedPath.length > 0) {
        const lats = optimizedPath.map(p => p.latitude);
        const lngs = optimizedPath.map(p => p.longitude);
        const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
        const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
        setMapCenter([centerLat, centerLng]);
        setMapZoom(10);
      }
      
      toast.success(`Route optimized! Total distance: ${totalDistance.toFixed(2)} km`);
    } catch (error) {
      toast.error('Failed to calculate optimal route');
    } finally {
      setLoading(false);
    }
  };

  const confirmRoute = async () => {
    if (!routeData || !selectedOfficer) {
      toast.error('No route to confirm');
      return;
    }

    try {
      const officer = officers.find(o => o.officerId === selectedOfficer);
      const routeRecords = [];

      // Create route records for each distribution
      for (let i = 1; i < routeData.path.length; i++) {
        const distribution = distributions.find(d => d.distributionId === routeData.path[i].id);
        if (distribution) {
          const distance = calculateDistance(
            routeData.path[i-1].latitude, routeData.path[i-1].longitude,
            routeData.path[i].latitude, routeData.path[i].longitude
          );

          routeRecords.push({
            distributionId: distribution.distributionId,
            fromOfficerId: officer.officerId,
            toReceiverId: distribution.receiverId,
            distance: parseFloat(distance.toFixed(2)),
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Save routes to database via API
      const response = await fetch('http://localhost:5016/api/route/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeRecords),
      });

      if (response.ok) {
        setIsConfirmed(true);
        toast.success('Route confirmed and saved to dashboard!');
      } else {
        toast.error('Failed to save route');
      }
    } catch (error) {
      console.error('Error confirming route:', error);
      toast.error('Failed to confirm route');
    }
  };

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleDistributionToggle = (distributionId) => {
    setSelectedDistributions(prev =>
      prev.includes(distributionId)
        ? prev.filter(id => id !== distributionId)
        : [...prev, distributionId]
    );
  };

  const selectAllDistributions = () => {
    const validDistributions = distributions.filter(d => d.latitude && d.longitude);
    if (selectedDistributions.length === validDistributions.length) {
      setSelectedDistributions([]);
    } else {
      setSelectedDistributions(validDistributions.map(d => d.distributionId));
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: 3,
          color: '#fff'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Route Optimization
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Calculate optimal delivery routes using advanced algorithms
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            <RouteIcon sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Panel - Controls */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MyLocationIcon color="primary" />
              Route Configuration
            </Typography>

            <FormControl fullWidth sx={{ mb: 3, mt: 2 }}>
              <InputLabel>Starting Officer</InputLabel>
              <Select
                value={selectedOfficer}
                label="Starting Officer"
                onChange={(e) => setSelectedOfficer(e.target.value)}
              >
                <MenuItem value="">Select an officer</MenuItem>
                {officers.map(officer => (
                  <MenuItem key={officer.officerId} value={officer.officerId}>
                    {officer.name} - {officer.officeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Distributions Selection */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Select Receivers by Distributions
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Select Distributions ({selectedDistributions.length} selected)
              </Typography>
              <Button size="small" onClick={selectAllDistributions}>
                {selectedDistributions.length === distributions.filter(d => d.latitude && d.longitude).length ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>
                
            {dataLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : distributions.filter(d => d.latitude && d.longitude).length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center', bgcolor: alpha('#f59e0b', 0.1), borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No distributions with valid receiver locations found.
                </Typography>
              </Box>
            ) : (
              <List sx={{ mb: 2, maxHeight: 280, overflow: 'auto', bgcolor: alpha('#3b82f6', 0.05), borderRadius: 2 }}>
                {distributions.filter(d => d.latitude && d.longitude).map(distribution => (
                      <ListItemButton
                        key={distribution.distributionId}
                        dense
                        onClick={() => handleDistributionToggle(distribution.distributionId)}
                        selected={selectedDistributions.includes(distribution.distributionId)}
                        sx={{ borderRadius: 1, mb: 0.5 }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={selectedDistributions.includes(distribution.distributionId)}
                            tabIndex={-1}
                            disableRipple
                            color="primary"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" component="span" fontWeight="medium">
                              {distribution.itemName} ({distribution.quantity} units)
                            </Typography>
                          }
                          secondary={
                            <Box component="span" sx={{ display: 'block' }}>
                              <Typography variant="caption" component="span" color="text.secondary">
                                👤 To: {distribution.receiverName}
                              </Typography>
                              <Typography variant="caption" component="span" display="block" color="text.secondary">
                                📍 {distribution.address || 'No address'}
                              </Typography>
                              <Typography variant="caption" component="span" display="block" color="text.secondary">
                                🎁 From: {distribution.donorName}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip 
                          label={distribution.status || 'Pending'} 
                          size="small" 
                          color={distribution.status === 'Delivered' ? 'success' : distribution.status === 'InTransit' ? 'warning' : 'default'}
                          sx={{ ml: 1 }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                )}

            <Button
              variant="contained"
              fullWidth
              onClick={calculateOptimalRoute}
              disabled={loading || !selectedOfficer || selectedDistributions.length === 0}
              sx={{ 
                mb: 2, 
                py: 1.5,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Calculate Optimal Route'}
            </Button>

            {routeData && !isConfirmed && (
              <Button
                variant="contained"
                fullWidth
                onClick={confirmRoute}
                sx={{ 
                  mb: 2, 
                  py: 1.5,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  }
                }}
              >
                Confirm & Save Route
              </Button>
            )}

            {isConfirmed && (
              <Chip 
                label="✓ Route Confirmed" 
                color="success" 
                sx={{ width: '100%', mb: 2, py: 1.5 }}
              />
            )}
          </Paper>

          {/* Route Details */}
          {routeData && (
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CarIcon color="primary" />
                Route Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: alpha('#3b82f6', 0.1), borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: '#3b82f6', width: 40, height: 40 }}>
                    <LocationIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Distance</Typography>
                    <Typography variant="h6" fontWeight="bold">{routeData.totalDistance} km</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: alpha('#f59e0b', 0.1), borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: '#f59e0b', width: 40, height: 40 }}>
                    <TimeIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Estimated Time</Typography>
                    <Typography variant="h6" fontWeight="bold">{routeData.estimatedTime} min</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: alpha('#10b981', 0.1), borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: '#10b981', width: 40, height: 40 }}>
                    <FuelIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Fuel Cost</Typography>
                    <Typography variant="h6" fontWeight="bold">${routeData.fuelCost}</Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Directions
              </Typography>
              <List dense>
                {routeData.directions.map((dir, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary={
                        <Typography variant="body2">
                          <strong>{index + 1}.</strong> {dir}
                        </Typography>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>

        {/* Right Panel - Map */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2, height: '700px', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon color="primary" />
                Route Map
              </Typography>
              {routeData && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip icon={<FlagIcon />} label="Start" size="small" color="success" />
                  <Chip label={`${routeData.path.length - 1} stops`} size="small" color="primary" />
                  <Chip icon={<FlagIcon />} label="End" size="small" color="error" />
                </Box>
              )}
            </Box>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: 'calc(100% - 40px)', width: '100%', borderRadius: '12px' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapCenterController center={mapCenter} zoom={mapZoom} />
              
              {/* Route markers when route is calculated */}
              {routeData && routeData.path.length > 0 && (
                <>
                  {/* Start marker */}
                  <Marker
                    position={[routeData.path[0].latitude, routeData.path[0].longitude]}
                    icon={startIcon}
                  >
                    <Popup>
                      <strong>🚀 START</strong><br />
                      {routeData.path[0].name}<br />
                      <em>Starting point</em>
                    </Popup>
                  </Marker>
                  
                  {/* Intermediate stops */}
                  {routeData.path.slice(1, -1).map((point, index) => (
                    <Marker
                      key={`route-${index}`}
                      position={[point.latitude, point.longitude]}
                      icon={createCustomIcon('#3b82f6', index + 1)}
                    >
                      <Popup>
                        <strong>📍 Stop #{index + 1}</strong><br />
                        <strong>{point.itemName}</strong> (Qty: {point.quantity})<br />
                        To: {point.name.split(' → ')[1] || point.name}
                      </Popup>
                    </Marker>
                  ))}
                  
                  {/* End marker (last destination) */}
                  {routeData.path.length > 1 && (
                    <Marker
                      position={[routeData.path[routeData.path.length - 1].latitude, routeData.path[routeData.path.length - 1].longitude]}
                      icon={routeData.path.length === 2 ? createCustomIcon('#3b82f6', 1) : endIcon}
                    >
                      <Popup>
                        <strong>🏁 {routeData.path.length === 2 ? 'Stop #1' : 'FINAL STOP'}</strong><br />
                        <strong>{routeData.path[routeData.path.length - 1].itemName}</strong> (Qty: {routeData.path[routeData.path.length - 1].quantity})<br />
                        To: {routeData.path[routeData.path.length - 1].name.split(' → ')[1] || routeData.path[routeData.path.length - 1].name}
                      </Popup>
                    </Marker>
                  )}
                  
                  {/* Route line with animated dashes */}
                  <Polyline
                    positions={routeData.path.map(p => [p.latitude, p.longitude])}
                    color="#3b82f6"
                    weight={4}
                    opacity={0.8}
                    dashArray="10, 10"
                  />
                  {/* Solid route underline for visibility */}
                  <Polyline
                    positions={routeData.path.map(p => [p.latitude, p.longitude])}
                    color="#1e40af"
                    weight={6}
                    opacity={0.3}
                  />
                </>
              )}
              
              {/* Default markers when no route - show officers and available donations */}
              {!routeData && (
                <>
                  {officers.filter(o => o.latitude && o.longitude).map(officer => (
                    <Marker
                      key={`officer-${officer.officerId}`}
                      position={[officer.latitude, officer.longitude]}
                      icon={createCustomIcon('#22c55e', 'O')}
                    >
                      <Popup>
                        <strong>{officer.name || officer.officeName}</strong><br />
                        Officer (Starting Point)
                      </Popup>
                    </Marker>
                  ))}
                </>
              )}
            </MapContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RouteOptimization;