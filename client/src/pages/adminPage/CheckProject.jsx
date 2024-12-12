import { useState, useEffect } from 'react';
import { Button, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import api from '../../services/api';

const CheckProject = () => {
  const [requests, setRequests] = useState([]); // ข้อมูลคำร้อง
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล

  // ดึงข้อมูลคำร้อง
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/project-requests/all');
        setRequests(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching project requests:", error);
        setRequests([]);
      } finally {
        setLoading(false); // ปิดสถานะการโหลด
      }
    };

    fetchRequests();
  }, []);

  // อัปเดตสถานะคำร้อง
  const handleStatusUpdate = async (requestId, status) => {
    try {
      await api.post('/project-requests/update-status', { requestId, status });
      setRequests((prev) =>
        prev.map((request) =>
          request.request_id === requestId ? { ...request, status } : request
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5">Approve or Reject Projects</Typography>
      </Grid>
      {requests.length > 0 ? (
        requests.map((request) => (
          <Grid item xs={12} key={request.request_id}>
            <Paper elevation={3} style={{ padding: '16px' }}>
              <Typography variant="h6">{request.project_name}</Typography>
              <Typography>Advisor ID: {request.advisor_id}</Typography>
              <Typography>Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}</Typography>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleStatusUpdate(request.request_id, 'approved')}
                disabled={request.status === 'approved'} // ปิดปุ่มถ้าสถานะเป็น approved
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleStatusUpdate(request.request_id, 'rejected')}
                disabled={request.status === 'rejected'} // ปิดปุ่มถ้าสถานะเป็น rejected
                style={{ marginLeft: '8px' }}
              >
                Reject
              </Button>
            </Paper>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Typography>No project requests found.</Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default CheckProject;
