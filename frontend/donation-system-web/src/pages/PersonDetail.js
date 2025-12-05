import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Grid, Paper } from '@mui/material';
import { getDonors, getOfficers, getReceivers } from '../utils/api';

const PersonDetail = ({ type }) => {
    const { id } = useParams();
    const [person, setPerson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPerson = async () => {
            try {
                let data;
                if (type === 'donor') {
                    const donors = await getDonors();
                    data = donors.find(d => d.donorId === parseInt(id));
                } else if (type === 'officer') {
                    const officers = await getOfficers();
                    data = officers.find(o => o.officerId === parseInt(id));
                } else if (type === 'receiver') {
                    const receivers = await getReceivers();
                    data = receivers.find(r => r.receiverId === parseInt(id));
                }
                setPerson(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPerson();
    }, [id, type]);

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (error || !person) {
        return <Typography color="error">Error: {error || 'Person not found'}</Typography>;
    }

    return (
        <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h4" gutterBottom>
                {type.charAt(0).toUpperCase() + type.slice(1)} Details
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="h6">Name:</Typography>
                    <Typography>{person.name}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="h6">Contact Number:</Typography>
                    <Typography>{person.contactNumber}</Typography>
                </Grid>
                <Grid size={12}>
                    <Typography variant="h6">Address:</Typography>
                    <Typography>{person.address}</Typography>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default PersonDetail;
