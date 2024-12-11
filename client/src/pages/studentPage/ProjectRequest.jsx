import { useState, useEffect } from "react";
import { Grid, Typography, Box, TextField, Button, MenuItem } from "@mui/material";
import api from "../../services/api";

const ProjectRequest = () => {
  const [projectName, setProjectName] = useState("");
  const [groupMembers, setGroupMembers] = useState([""]);
  const [advisors, setAdvisors] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [projectStatus, setProjectStatus] = useState([]);

  // Fetch advisors
  useEffect(() => {
    api
      .get("/teacher")
      .then((response) => setAdvisors(response.data))
      .catch((error) => console.error("Error fetching advisors:", error));
  }, []);

  // Fetch students
  useEffect(() => {
    api
      .get("/users")
      .then((response) => {
        const studentUsers = response.data.filter((user) => user.role === "student");
        setStudents(studentUsers);
      })
      .catch((error) => console.error("Error fetching students:", error));
  }, []);

  // Fetch project statuses
  useEffect(() => {
    const initializeData = async () => {
      try {
        const sessionResponse = await api.get("/auth/check-session");
        const { user_id } = sessionResponse.data.user;

        const response = await api.get("/project-requests/status", {
          params: { studentId: user_id },
        });
        setProjectStatus(response.data.data);
      } catch (error) {
        console.error("Error initializing data:", error.response?.data || error.message);
      }
    };

    initializeData();
  }, []);

  // Submit request
  const handleSubmit = async () => {
    try {
      const sessionResponse = await api.get("/auth/check-session");
      const { user_id } = sessionResponse.data.user;

      await api.post("/project-requests/create", {
        projectName,
        groupMembers,
        advisorId: selectedAdvisor,
        studentId: user_id,
      });

      console.log("Request submitted successfully");

      // Fetch updated project status
      const updatedStatus = await api.get("/project-requests/status", {
        params: { studentId: user_id },
      });
      setProjectStatus(updatedStatus.data.data);
    } catch (error) {
      console.error("Error submitting request:", error.response?.data || error.message);
    }
  };

  const handleAddMember = () => {
    if (groupMembers.length < 3) {
      setGroupMembers([...groupMembers, ""]);
    }
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = [...groupMembers];
    updatedMembers.splice(index, 1);
    setGroupMembers(updatedMembers);
  };

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
        <TextField
          fullWidth
          label="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          sx={{ marginBottom: 2 }}
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
          disabled={advisors.length === 0}
          sx={{ marginBottom: 2 }}
        >
          {advisors.map((advisor) => (
            <MenuItem key={advisor.teacher_id} value={advisor.teacher_id}>
              {advisor.teacher_name}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={handleSubmit}>
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
