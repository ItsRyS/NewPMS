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
} from "@mui/material";
import axios from "axios";
import NavbarHome from "../components/NavHome";
import FooterHome from "../components/FooterHome";

const TeacherPage = () => {
  const [teachers, setTeachers] = useState([]); // เก็บข้อมูลอาจารย์ทั้งหมด
  const [selectedTeacher, setSelectedTeacher] = useState(null); // เก็บข้อมูลอาจารย์ที่เลือก
  const [open, setOpen] = useState(false); // จัดการสถานะ Modal
  const [error, setError] = useState(null); // จัดการข้อผิดพลาด

  const handleOpen = (teacher) => {
    setSelectedTeacher(teacher);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTeacher(null);
  };

  useEffect(() => {
    // เรียก API เพื่อดึงข้อมูลอาจารย์
    axios
      .get("http://localhost:5000/api/teacher") // ตรวจสอบให้ตรงกับ Endpoint
      .then((response) => {
        setTeachers(response.data); // ตั้งค่า State ด้วยข้อมูลที่ได้รับ
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      });
  }, []);

  return (
    <>
      <NavbarHome />
      <Container
        className="content-teacher"
        maxWidth={false}
        sx={{
          paddingTop: "auto",
          paddingBottom: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          boxSizing: "border-box",
          flexDirection: "column",
        }}
      >
        <Box sx={{ flexGrow: 1, padding: 3, width: "100%", paddingTop: 10 }}>
          {/* แสดงข้อความ error หากเกิดข้อผิดพลาด */}
          {error && (
            <Typography variant="body1" color="error" sx={{ mb: 3 }}>
              {error}
            </Typography>
          )}

          <Grid container spacing={3}>
            {teachers.map((teacher) => (
              <Grid item xs={12} sm={6} md={4} key={teacher.teacher_id}>
                <Card
                  onClick={() => handleOpen(teacher)}
                  sx={{ cursor: "pointer" }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={teacher.teacher_image}
                    alt={teacher.teacher_name}
                  />
                  <CardContent>
                    <Typography variant="h6">{teacher.teacher_name}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Modal แสดงข้อมูลอาจารย์แบบละเอียด */}
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
                    image={selectedTeacher.teacher_image}
                    alt={selectedTeacher.teacher_name}
                  />
                  <Typography variant="h5" gutterBottom>
                    {selectedTeacher.teacher_name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>เบอร์โทรศัพท์:</strong>{" "}
                    {selectedTeacher.teacher_phone}
                  </Typography>
                  <Typography variant="body1">
                    <strong>อีเมล์:</strong> {selectedTeacher.teacher_email}
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

      <FooterHome />
    </>
  );
};

export default TeacherPage;
