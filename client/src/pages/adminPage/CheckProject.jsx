import { useState, useEffect } from "react";
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
} from "@mui/material";
import api from "../../services/api";

const CheckProject = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // เก็บสถานะที่ต้องการกรอง

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get("/project-requests/all");
        setRequests(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(
          "Error fetching project requests:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleStatusUpdate = async (requestId, status) => {
    try {
      // เรียก Endpoint อัปเดตสถานะ
      await api.put("/projects/update-status", { requestId, status });

      // อัปเดตสถานะใน UI
      setRequests((prev) =>
        prev.map((request) =>
          request.request_id === requestId ? { ...request, status } : request
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // ฟังก์ชันสำหรับกรองสถานะ
  const filteredRequests =
    filterStatus === "all"
      ? requests
      : requests.filter((request) => request.status === filterStatus);

  if (loading) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        style={{ height: "100vh" }}
      >
        <Typography>Loading...</Typography>
      </Grid>
    );
  }

  return (
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}>
      {/* หัวข้อและตัวเลือกกรอง */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Approve or Reject Projects
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="status-filter-label">Filter Status</InputLabel>
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
      <Grid container spacing={2} sx={{ marginTop: 2, overflowX: "auto" }}>
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Grid item xs={12} md={6} key={request.request_id}>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  backgroundColor:
                    request.status === "approved"
                      ? "SpringGreen"
                      : request.status === "rejected"
                        ? "salmon"
                        : "lightgray",
                  color: "white",
                }}
              >
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    textDecoration: "underline",
                    fontWeight: "bold",
                  }}
                >
                  {request.project_name}
                </Typography>
                <Typography>
                  <strong>Advisor:</strong> {request.teacher_name || "N/A"}
                </Typography>
                <Typography>
                  <strong>Students:</strong> {request.students || "N/A"}
                </Typography>
                <Typography>
                  <strong>Status:</strong>{" "}
                  {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)}
                </Typography>
                <Box sx={{ marginTop: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() =>
                      handleStatusUpdate(request.request_id, "approved")
                    }
                    disabled={request.status === "approved"}
                    sx={{ marginRight: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() =>
                      handleStatusUpdate(request.request_id, "rejected")
                    }
                    disabled={request.status === "rejected"}
                  >
                    Reject
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
