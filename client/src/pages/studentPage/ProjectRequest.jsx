import { useState, useEffect, useCallback } from "react";
import { Grid, Typography, Box, TextField, Button, MenuItem, CircularProgress, Alert } from "@mui/material";
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

  // ดึงข้อมูลทั้งหมด
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [advisorResponse, studentResponse, sessionResponse] = await Promise.all([
          api.get("/teacher"),
          api.get("/users"),
          api.get("/auth/check-session"),
        ]);

        const studentUsers = studentResponse.data.filter((user) => user.role === "student");
        setAdvisors(advisorResponse.data);
        setStudents(studentUsers);

        const { user_id } = sessionResponse.data.user;
        const statusResponse = await api.get("/project-requests/status", {
          params: { studentId: user_id },
        });
        const statuses = statusResponse.data.data;
        setProjectStatus(statuses);

        // ตรวจสอบสถานะล่าสุด
        const latestRequest = statuses[statuses.length - 1]; // คำร้องล่าสุด
        setLatestStatus(latestRequest?.status || "");
        setCanSubmit(!(latestRequest?.status === "pending" || latestRequest?.status === "approved"));
      } catch (error) {
        console.error("Error fetching data:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ฟังก์ชันส่งคำขอ
  const handleSubmit = useCallback(async () => {
    try {
      const sessionResponse = await api.get("/auth/check-session");
      const { user_id } = sessionResponse.data.user;

      await api.post("/project-requests/create", {
        projectName,
        groupMembers,
        advisorId: selectedAdvisor,
        studentId: user_id,
      });

      const updatedStatus = await api.get("/project-requests/status", {
        params: { studentId: user_id },
      });
      setProjectStatus(updatedStatus.data.data);
      setCanSubmit(false); // ปิดฟอร์มหลังส่งคำร้องสำเร็จ
    } catch (error) {
      console.error("Error submitting request:", error.response?.data || error.message);
    }
  }, [projectName, groupMembers, selectedAdvisor]);

  // เพิ่มสมาชิก
  const handleAddMember = useCallback(() => {
    if (groupMembers.length < 3) {
      setGroupMembers([...groupMembers, ""]);
    }
  }, [groupMembers]);

  // ลบสมาชิก
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
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 4,
        padding: 4,
        backgroundColor: "#f5f5f5",
        borderRadius: 2,
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Form Section */}
      <Box
        sx={{
          flex: 1,
          padding: 3,
          backgroundColor: "#ffffff",
          borderRadius: 2,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          width: { xs: "100%", md: "50%" },
        }}
      >
        <Typography variant="h5" gutterBottom>
          Request a Project
        </Typography>
        {!canSubmit && (
          latestStatus === "approved" ? (
            <Alert severity="success" sx={{ marginBottom: 2 }}>
              Congratulations! Your project request has been approved.
            </Alert>
          ) : (
            <Alert severity="info" sx={{ marginBottom: 2 }}>
              You already have a pending project request. Please wait for approval or rejection before submitting a new request.
            </Alert>
          )
        )}
        <TextField
          fullWidth
          label="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          sx={{ marginBottom: 2 }}
          disabled={!canSubmit}
        />
        {groupMembers.map((member, index) => (
          <Grid container spacing={2} key={index}>
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
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit}>
          Submit Request
        </Button>
      </Box>

      {/* Status Section */}
      <Box
        sx={{
          flex: 1,
          padding: 3,
          backgroundColor: "#ffffff",
          borderRadius: 2,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          width: { xs: "100%", md: "50%" },
        }}
      >
        <Typography variant="h6" gutterBottom>
          Document Status
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {projectStatus.map((status) => (
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
              }}
            >
              <Typography variant="body1">
                <strong>{status.project_name}</strong>
              </Typography>
              <Typography variant="body2">
                Status: {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectRequest;
