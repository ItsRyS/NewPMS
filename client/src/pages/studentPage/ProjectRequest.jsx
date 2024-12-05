import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

const ProjectRequest = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [projectNameThai, setProjectNameThai] = useState("");
  const [projectNameEnglish, setProjectNameEnglish] = useState("");
  const [groupMember1, setGroupMember1] = useState("");
  const [groupMember2, setGroupMember2] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Fetch teachers data from API
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/teacher");
        setTeachers(response.data);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      }
    };

    fetchTeachers();
  }, []);

  const handleAdvisorChange = (event) => {
    setSelectedAdvisor(event.target.value);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = () => {
    // Check if all fields are filled
    if (
      !projectNameThai ||
      !projectNameEnglish ||
      !groupMember1 ||
      !groupMember2 ||
      !selectedAdvisor
    ) {
      setSnackbarOpen(true); // Open snackbar if any field is missing
    } else {
      // Handle form submission logic
      console.log("Form submitted successfully!");
      console.log({
        projectNameThai,
        projectNameEnglish,
        groupMember1,
        groupMember2,
        selectedAdvisor,
      });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        padding: 4,
        bgcolor: "#f5f5f5",
        height: "100vh",
      }}
    >
      {/* Left Section */}
      <Box
        sx={{
          flex: 1,
          bgcolor: "#e0e0e0",
          padding: 3,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            marginBottom: 2,
            fontWeight: "bold",
            color: "#333",
            textAlign: "center",
          }}
        >
          กรอกข้อมูลขอเปิดโครงการ
        </Typography>

        <Grid container spacing={2} alignItems="center">
          {/* Project Name in Thai */}
          <Grid item xs={5}>
            <Typography>ชื่อโครงการ (ภาษาไทย)</Typography>
          </Grid>
          <Grid item xs={7}>
            <TextField
              fullWidth
              variant="outlined"
              value={projectNameThai}
              onChange={(e) => setProjectNameThai(e.target.value)}
            />
          </Grid>

          {/* Project Name in English */}
          <Grid item xs={5}>
            <Typography>ชื่อโครงการ (ภาษาอังกฤษ)</Typography>
          </Grid>
          <Grid item xs={7}>
            <TextField
              fullWidth
              variant="outlined"
              value={projectNameEnglish}
              onChange={(e) => setProjectNameEnglish(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="h6"
              sx={{ marginBottom: 2, fontWeight: "bold", color: "#333" }}
            >
              สมาชิกกลุ่ม
            </Typography>
          </Grid>

          {/* Group Members */}
          <Grid item xs={5}>
            <Typography>ชื่อ-นามสกุล (สมาชิกกลุ่ม)</Typography>
          </Grid>
          <Grid item xs={7}>
            <TextField
              fullWidth
              variant="outlined"
              value={groupMember1}
              onChange={(e) => setGroupMember1(e.target.value)}
            />
          </Grid>

          <Grid item xs={5}>
            <Typography>ชื่อ-นามสกุล (สมาชิกกลุ่ม)</Typography>
          </Grid>
          <Grid item xs={7}>
            <TextField
              fullWidth
              variant="outlined"
              value={groupMember2}
              onChange={(e) => setGroupMember2(e.target.value)}
            />
          </Grid>

          {/* Advisor Name */}
          <Grid item xs={5}>
            <Typography>ชื่อ-นามสกุล (อาจารย์ที่ปรึกษา)</Typography>
          </Grid>
          <Grid item xs={7}>
            <FormControl fullWidth>
              <InputLabel>เลือกอาจารย์</InputLabel>
              <Select
                value={selectedAdvisor}
                onChange={handleAdvisorChange}
                variant="outlined"
              >
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.teacher_id} value={teacher.teacher_id}>
                    {teacher.teacher_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ height: "50px", fontWeight: "bold" }}
              onClick={handleSubmit}
            >
              ยืนยันการส่ง
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Right Section */}
      <Box
        sx={{
          flex: 1,
          bgcolor: "#ffa726",
          borderRadius: 2,
          padding: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "#fff", textAlign: "center" }}
        >
          สถานะการส่งคำร้องขอเปิดโครงการ
        </Typography>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="warning"
          sx={{ width: "500" }}
        >
          กรุณากรอกข้อมูลให้ครบถ้วน!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectRequest;
