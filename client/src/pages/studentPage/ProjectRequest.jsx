import { useState, useEffect } from "react";
import { Grid, Typography, Box, TextField, Button, MenuItem } from "@mui/material";
import api from "../../services/api";

const ProjectRequest = () => {
  const [projectName, setProjectName] = useState("");
  const [groupMembers, setGroupMembers] = useState([""]);
  const [advisors, setAdvisors] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [status, setStatus] = useState("Pending");
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
    const abortController = new AbortController();

    api
      .get("/auth/check-session", { signal: abortController.signal })
      .then((sessionResponse) => {
        const { user_id } = sessionResponse.data.user;

        api
          .get("/project-requests/status", {
            params: { studentId: user_id },
            signal: abortController.signal,
          })
          .then((response) => setProjectStatus(response.data.data))
          .catch((error) => {
            if (error.name !== "AbortError") {
              console.error("Error fetching project statuses:", error.response?.data || error.message);
            }
          });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Session Error:", error.response?.data || error.message);
        }
      });

    return () => abortController.abort();
  }, []);

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

  const handleSubmit = () => {
    api
      .get("/auth/check-session")
      .then((sessionResponse) => {
        const { user_id } = sessionResponse.data.user;

        api
          .post("/project-requests/create", {
            projectName,
            groupMembers,
            advisorId: selectedAdvisor,
            studentId: user_id,
          })
          .then((response) => {
            console.log(response.data);
            setStatus("Pending");
          })
          .catch((error) =>
            console.error("Submission Error:", error.response?.data || error.message)
          );
      })
      .catch((error) => {
        console.error("Session Error:", error.response?.data || error.message);
      });
  };

  return (
    <Grid container spacing={2}>
      {/* Left section: Project request form */}
      <Grid item xs={12} md={8}>
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
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={status === "Pending"}
        >
          Submit Request
        </Button>
      </Grid>

      {/* Right section: Project status */}
      <Grid item xs={12} md={4}>
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
      </Grid>
    </Grid>
  );
};

export default ProjectRequest;
