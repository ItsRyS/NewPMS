import { useState, useEffect } from "react";
import { TextField, Button, MenuItem, Typography, Grid } from "@mui/material";
import api from "../../services/api"; // ใช้ instance ที่สร้างไว้

const ProjectRequest = () => {
  const [projectName, setProjectName] = useState("");
  const [groupMembers, setGroupMembers] = useState([""]);
  const [advisors, setAdvisors] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [status, setStatus] = useState("");

  // ดึงข้อมูลอาจารย์
  useEffect(() => {
    api.get("/teacher")
      .then((response) => {
        console.log("API Response for Advisors:", response.data);
        if (Array.isArray(response.data)) {
          setAdvisors(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setAdvisors([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching advisors:", error);
        setAdvisors([]);
      });
  }, []);

  // ดึงข้อมูลนักศึกษา
  useEffect(() => {
    api.get("/users")
      .then((response) => {
        console.log("API Response for Students:", response.data);
        if (Array.isArray(response.data)) {
          const studentUsers = response.data.filter((user) => user.role === "student");
          setStudents(studentUsers);
        } else {
          console.error("Unexpected response format:", response.data);
          setStudents([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        setStudents([]);
      });
  }, []);

  const handleAddMember = () => {
    if (groupMembers.length < 3) {
      setGroupMembers([...groupMembers, ""]); // เพิ่มช่องใหม่ใน Group Members
    }
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = [...groupMembers];
    updatedMembers.splice(index, 1);
    setGroupMembers(updatedMembers);
  };

  const handleSubmit = () => {
    // ดึงข้อมูล user จาก session (ตัวอย่างสมมติว่าคุณใช้ Context หรือดึงผ่าน API check-session)
    api.get("/auth/check-session")
      .then((sessionResponse) => {
        const { user_id } = sessionResponse.data.user;
  
        api.post("/project-requests/create", {
          projectName,
          groupMembers, // ส่งเป็น Array เช่น [1, 2, 3]
          advisorId: selectedAdvisor,
          studentId: user_id, // ดึงค่า user_id จาก session
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
      <Grid item xs={12}>
        <Typography variant="h5">Request a Project</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </Grid>
      {groupMembers.map((member, index) => (
        <Grid item xs={12} key={index}>
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
          {index > 0 && (
            <Button onClick={() => handleRemoveMember(index)}>Remove</Button>
          )}
        </Grid>
      ))}
      {groupMembers.length < 3 && (
        <Grid item xs={12}>
          <Button onClick={handleAddMember}>Add Member</Button>
        </Grid>
      )}
      <Grid item xs={12}>
        <TextField
          select
          fullWidth
          label="Select Advisor"
          value={selectedAdvisor}
          onChange={(e) => setSelectedAdvisor(e.target.value)}
          disabled={advisors.length === 0}
        >
          {advisors.length > 0 ? (
            advisors.map((advisor) => (
              <MenuItem key={advisor.teacher_id} value={advisor.teacher_id}>
                {advisor.teacher_name}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No advisors available</MenuItem>
          )}
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" onClick={handleSubmit}>
          Submit Request
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          Status: {status || "Not Submitted"}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default ProjectRequest;
