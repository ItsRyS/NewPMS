import { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import api from "../../services/api";

const ProjectRequest = () => {
  const [projectName, setProjectName] = useState("");
  const [groupMembers, setGroupMembers] = useState([""]);
  const [advisors, setAdvisors] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [projectStatus, setProjectStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [latestStatus, setLatestStatus] = useState("");

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [advisorResponse, studentResponse, sessionResponse] =
          await Promise.all([
            api.get("/teacher"),
            api.get("/users"),
            api.get("/auth/check-session"),
          ]);

        const studentUsers = studentResponse.data.filter(
          (user) => user.role === "student"
        );
        setAdvisors(advisorResponse.data);
        setStudents(studentUsers);

        const { user_id } = sessionResponse.data.user;
        setGroupMembers([user_id]);

        // ดึงสถานะคำขอล่าสุด
        const statusResponse = await api.get("/project-requests/status", {
          params: { studentId: user_id },
        });
        const statuses = statusResponse.data.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setProjectStatus(statuses);

        const hasApproved = statuses.some((status) => status.status === "approved");
      setLatestStatus(hasApproved ? "approved" : statuses[0]?.status || "");

        setCanSubmit(
          !(
            statuses.some((status) => status.status === "pending") ||
            hasApproved
          )
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Submit new project request
  const handleSubmit = useCallback(async () => {
    try {
      const sessionResponse = await api.get("/auth/check-session");
      const { user_id } = sessionResponse.data.user;
  
      // ส่งคำขอใหม่ไปยังเซิร์ฟเวอร์
      const response = await api.post("/project-requests/create", {
        projectName,
        groupMembers,
        advisorId: selectedAdvisor,
        studentId: user_id,
      });
      console.log("Response from server:", response.data);

      // ดึงสถานะล่าสุดหลังจากส่งคำขอสำเร็จ
      const updatedStatus = await api.get("/project-requests/status", {
        params: { studentId: user_id },
      });
  
      const statuses = updatedStatus.data.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
  
      setProjectStatus(statuses);
      setLatestStatus(statuses[0]?.status || "");
      setCanSubmit(false);
    } catch (error) {
      console.error("Error submitting request:", error.response?.data || error.message);
      if (error.response?.data?.message) {
        alert(error.response.data.message); // แจ้งเตือนเมื่อมีสมาชิกอยู่ในโครงการที่ pending/approved
      }
    }
  }, [projectName, groupMembers, selectedAdvisor]);
  

  // Add group member
  const handleAddMember = useCallback(() => {
    if (groupMembers.length < 3) {
      setGroupMembers([...groupMembers, ""]);
    }
  }, [groupMembers]);

  // Remove group member
  const handleRemoveMember = useCallback(
    (index) => {
      const updatedMembers = [...groupMembers];
      updatedMembers.splice(index, 1);
      setGroupMembers(updatedMembers);
    },
    [groupMembers]
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        
        borderRadius: 2,
        width: "100%",
        flexDirection: { xs: "column", md: "row" },
        display: "flex",
        gap: 2,
      }}
    >
      {/* Form Section */}
      <Paper
        elevation={3}
        sx={{ padding: 4, borderRadius: 3, width: "100%", maxWidth: 800 }}
      >
        <Typography variant="h5" gutterBottom>
          Request a Project
        </Typography>
        {!canSubmit &&
          (latestStatus === "approved" ? (
            <Alert severity="success" sx={{ marginBottom: 2 }}>
              ยินดีด้วย! โครงการของคุณได้รับการอนุมัติแล้ว กรุณาไปยังหน้าส่งเอกสารเพื่อส่งโครงการของคุณ
            </Alert>
          ) : (
            <Alert severity="info" sx={{ marginBottom: 2 }}>
              You already have a pending project request. Please wait for
              approval or rejection before submitting a new request.
            </Alert>
          ))}
        <TextField
          fullWidth
          label="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          sx={{ marginBottom: 2 }}
          disabled={!canSubmit}
        />
        {groupMembers.map((member, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
            <Grid item xs={10}>
              <TextField
                select
                fullWidth
                label={`Group Member ${index + 1}`}
                value={groupMembers[index] || ""}
                onChange={(e) => {
                  const updatedMembers = [...groupMembers];
                  updatedMembers[index] = e.target.value;
                  setGroupMembers(updatedMembers);
                }}
                disabled={!canSubmit}
              >
                {students.map((student) => (
                  <MenuItem key={student.user_id} value={student.user_id}>
                    {student.username}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={2}>
              {index > 0 && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleRemoveMember(index)}
                  disabled={!canSubmit}
                >
                  Remove
                </Button>
              )}
            </Grid>
          </Grid>
        ))}
        {groupMembers.length < 3 && (
          <Button
            variant="outlined"
            onClick={handleAddMember}
            sx={{ marginBottom: 2 }}
            disabled={!canSubmit}
          >
            Add Member
          </Button>
        )}
        <TextField
          select
          fullWidth
          label="Select Advisor"
          value={selectedAdvisor}
          onChange={(e) => setSelectedAdvisor(e.target.value)}
          disabled={advisors.length === 0 || !canSubmit}
          sx={{ marginBottom: 2 }}
        >
          {advisors.map((advisor) => (
            <MenuItem key={advisor.teacher_id} value={advisor.teacher_id}>
              {advisor.teacher_name}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          Submit Request
        </Button>
      </Paper>

      {/* Status Section */}
      <Paper
        elevation={3}
        sx={{ padding: 4, borderRadius: 3, width: "100%", maxWidth: 800 }}
      >
        <Typography variant="h6" gutterBottom>
          Document Status
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {projectStatus.map((status, index) => (
            <Box
              key={status.request_id}
              sx={{
                padding: 2,
                borderRadius: 2,
                backgroundColor:
                  status.status === "pending"
                    ? "#9e9e9e"
                    : status.status === "approved"
                    ? "#4caf50"
                    : "#f44336",
                color: "#fff",
                border: index === 0 ? "2px solid #000" : "none", // เน้นคำขอล่าสุด
              }}
            >
              <Typography variant="body1">
                <strong>
                  {index === 0 ? "Latest Request:" : ""} {status.project_name}
                </strong>
              </Typography>
              <Typography variant="body2">
                Status:{" "}
                {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default ProjectRequest;
