import { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Grid,
  Paper,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import api from '../../services/api';
import { useSnackbar } from '../../components/ReusableSnackbar';
const CheckProject = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const showSnackbar = useSnackbar();
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/project-requests/all');
        console.log("API Response Data:", response.data);
        const uniqueRequests = [...new Map(response.data.data.map(item => [item.request_id, item])).values()];

        setRequests(uniqueRequests);
      } catch (error) {
        console.error('Error fetching project requests:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);


  const handleStatusUpdate = async (requestId, status) => {
    try {
      await api.put('/projects/update-status', { requestId, status });

      setRequests((prev) =>
        prev.map((request) =>
          request.request_id === requestId ? { ...request, status } : request
        )
      );
      showSnackbar(
        `Project ${status === 'approved' ? 'Approved ' : 'Rejected '} Successfully.`,
        'success'
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  //  Debugging: ตรวจสอบค่าของ filterStatus และ requests ก่อนกรอง
  //console.log("Filter Status:", filterStatus);
  //console.log("Requests Before Filtering:", requests);

  {/* ทดสองปิด
const filteredRequests =
    requests && requests.length > 0
      ? filterStatus === 'all'
        ? requests
        : requests.filter((request) => request.status === filterStatus)
      : [];

    */}
  //  Debugging: ตรวจสอบว่าหลังจากกรองข้อมูลแล้ว filteredRequests เป็นอย่างไร
  // console.log("Requests After Filtering:", filteredRequests);

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Grid>
    );
  }

  return (
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            ตรวจสอบคำร้องโครงงาน
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="status-filter-label">กรองสถานะ</InputLabel>
            <Select
              labelId="status-filter-label"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Filter Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* รายการคำร้อง */}
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
      {requests.length > 0 ? (
          requests
            .filter((request) => filterStatus === 'all' || request.status === filterStatus)
            .map((request) => (
            <Grid item xs={12} md={6} key={request.request_id}>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  backgroundColor:
                    request.status === 'approved'
                      ? 'SpringGreen'
                      : request.status === 'rejected'
                        ? 'salmon'
                        : 'lightgray',
                  color: 'white',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {request.project_name}
                </Typography>
                <Typography>
                  <strong>Advisor:</strong> {request.teacher_name || 'N/A'}
                </Typography>
                <Typography>
                  <strong>Student:</strong> {request.student_name || 'N/A'}
                </Typography>
                <Typography>
                  <strong>Status:</strong> {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Typography>
                <Box sx={{ marginTop: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleStatusUpdate(request.request_id, 'approved')}
                    disabled={request.status === 'approved'}
                    sx={{ marginRight: 1 }}
                  >
                    อนุมัติ
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleStatusUpdate(request.request_id, 'rejected')}
                    disabled={request.status === 'rejected'}
                  >
                    ไม่อนุมัติ
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography>No project requests found.</Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default CheckProject;