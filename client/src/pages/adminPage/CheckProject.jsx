import { useState, useEffect } from 'react';
import { Button, Typography, Grid, Paper } from '@mui/material';
import api from '../../services/api';

const CheckProject = () => {
  const [requests, setRequests] = useState([]); // ตั้งค่าเริ่มต้นเป็นอาร์เรย์

  useEffect(() => {
    api
      .get('/project-requests/all')
      .then((response) => {
        // ตรวจสอบว่า response.data เป็นอาร์เรย์หรือไม่
        setRequests(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.error(error);
        setRequests([]); // ในกรณีที่เกิดข้อผิดพลาด ให้ตั้งค่าเป็นอาร์เรย์ว่าง
      });
  }, []);

  const handleStatusUpdate = (requestId, status) => {
    api
      .post('/project-requests/update-status', { requestId, status })
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
      {Array.isArray(requests) && requests.length > 0 ? (
        requests.map((request) => (
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
