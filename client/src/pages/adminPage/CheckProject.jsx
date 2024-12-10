import  { useState, useEffect } from 'react';
import { Button, Typography, Grid, Paper } from '@mui/material';
import axios from 'axios';

const CheckProject = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    axios.get('/api/project-requests/all').then((response) => {
      setRequests(response.data || []);
    }).catch((error) => {
      console.error(error);
      setRequests([]);
    });
  }, []);

  const handleStatusUpdate = (requestId, status) => {
    axios
      .post('/api/project-requests/update-status', { requestId, status })
      .then(() => {
        setRequests((prev) =>
          prev.map((request) =>
            request.request_id === requestId ? { ...request, status } : request
          )
        );
      })
      .catch((error) => console.error(error));
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5">Approve or Reject Projects</Typography>
      </Grid>
      {requests.map((request) => (
        <Grid item xs={12} key={request.request_id}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            <Typography variant="h6">{request.project_name}</Typography>
            <Typography>Advisor ID: {request.advisor_id}</Typography>
            <Typography>Status: {request.status}</Typography>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleStatusUpdate(request.request_id, 'approved')}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleStatusUpdate(request.request_id, 'rejected')}
              style={{ marginLeft: '8px' }}
            >
              Reject
            </Button>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default CheckProject;
