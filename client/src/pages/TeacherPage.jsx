import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Grid,
  Modal,
  Button,
  Container,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import axios from "axios";
import NavbarHome from "../components/NavHome";
import FooterHome from "../components/FooterHome";

const TeacherPage = () => {
  const [teachers, setTeachers] = useState([]); // All teachers data
  const [filteredTeachers, setFilteredTeachers] = useState([]); // Filtered data
  const [selectedTeacher, setSelectedTeacher] = useState(null); // For modal
  const [open, setOpen] = useState(false); // Modal open state
  const [error, setError] = useState(null); // Error handling
  const [searchTerm, setSearchTerm] = useState(""); // Name search term
  const [expertiseFilter, setExpertiseFilter] = useState(""); // Expertise filter
  const [expertiseOptions, setExpertiseOptions] = useState([]); // Dropdown options

  const placeholderImage = "https://via.placeholder.com/140x100?text=No+Image"; // Placeholder URL

  const handleOpen = (teacher) => {
    setSelectedTeacher(teacher);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTeacher(null);
  };

  useEffect(() => {
    // Fetch teacher data from API
    axios
      .get("http://localhost:5000/api/teacher") // Adjust your endpoint
      .then((response) => {
        setTeachers(response.data);
        setFilteredTeachers(response.data);

        // Extract unique expertise options
        const uniqueExpertise = [
          ...new Set(response.data.map((teacher) => teacher.teacher_expert)),
        ];
        setExpertiseOptions(uniqueExpertise);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      });
  }, []);

  useEffect(() => {
    // Combine search and expertise filters
    const filtered = teachers.filter((teacher) => {
      const matchesName = teacher.teacher_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesExpertise =
        expertiseFilter === "" || teacher.teacher_expert === expertiseFilter;

      return matchesName && matchesExpertise;
    });
    setFilteredTeachers(filtered);
  }, [searchTerm, expertiseFilter, teachers]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavbarHome />
      <Box sx={{ flex: 1, paddingBottom: "64px" }}>
        {/* Adds space for the fixed footer */}
        <Container
          className="content-teacher"
          maxWidth="lg"
          sx={{
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBlock: "90px",
            justifyContent: "center",
            boxShadow: 10,
            borderRadius: "12px",
            padding: 0,
          }}
        >
          <Box sx={{ width: "100%", padding: 2 }}>
            {/* Error Message */}
            {error && (
              <Typography variant="body1" color="error" sx={{ mb: 3 }}>
                {error}
              </Typography>
            )}

            {/* Search and Filter Row */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="ค้นหาชื่ออาจารย์"
                  variant="outlined"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>กรองตามความชำนาญ</InputLabel>
                  <Select
                    value={expertiseFilter}
                    onChange={(e) => setExpertiseFilter(e.target.value)}
                  >
                    <MenuItem value="">แสดงทั้งหมด</MenuItem>
                    {expertiseOptions.map((expertise, index) => (
                      <MenuItem key={index} value={expertise}>
                        {expertise}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Teacher Cards */}
            <Grid container spacing={3}>
              {filteredTeachers.map((teacher) => (
                <Grid item xs={12} sm={6} md={4} key={teacher.teacher_id}>
                  <Card
                    onClick={() => handleOpen(teacher)}
                    sx={{ cursor: "pointer" }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={
                        teacher.teacher_image
                          ? `http://localhost:5000/upload/pic/${teacher.teacher_image}`
                          : placeholderImage
                      }
                      alt={teacher.teacher_name || "No Image"}
                    />
                    <CardContent>
                      <Typography variant="h6">{teacher.teacher_name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        ความชำนาญ: {teacher.teacher_expert}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Modal for Detailed Info */}
            <Modal open={open} onClose={handleClose}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 400,
                  bgcolor: "background.paper",
                  border: "2px solid #000",
                  boxShadow: 24,
                  p: 4,
                }}
              >
                {selectedTeacher && (
                  <>
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        selectedTeacher.teacher_image
                          ? `http://localhost:5000/upload/pic/${selectedTeacher.teacher_image}`
                          : placeholderImage
                      }
                      alt={selectedTeacher.teacher_name || "No Image"}
                    />
                    <Typography variant="h5" gutterBottom>
                      {selectedTeacher.teacher_name}
                    </Typography>
                    <Typography variant="body1">
                      <strong>เบอร์โทรศัพท์:</strong> {selectedTeacher.teacher_phone}
                    </Typography>
                    <Typography variant="body1">
                      <strong>อีเมล์:</strong> {selectedTeacher.teacher_email}
                    </Typography>
                    <Typography variant="body1">
                      <strong>ความชำนาญ:</strong> {selectedTeacher.teacher_expert}
                    </Typography>
                    <Typography variant="body1">
                      <strong>ข้อมูลเพิ่มเติม:</strong>{" "}
                      {selectedTeacher.teacher_bio}
                    </Typography>
                    <Button
                      onClick={handleClose}
                      variant="contained"
                      sx={{ mt: 2 }}
                    >
                      ปิด
                    </Button>
                  </>
                )}
              </Box>
            </Modal>
          </Box>
        </Container>
      </Box>
      <FooterHome />
    </Box>
  );
};

export default TeacherPage;
