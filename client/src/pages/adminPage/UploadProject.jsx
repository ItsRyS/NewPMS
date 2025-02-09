import { useState, useEffect } from "react";
import { TextField, Button, MenuItem, Typography, Container, Paper } from "@mui/material";
import api from "../../services/api";
import { useSnackbar } from "../../components/ReusableSnackbar"; // ใช้ Snackbar สำหรับแจ้งเตือน

const UploadProject = () => {
  const showSnackbar = useSnackbar(); // ใช้ฟังก์ชันแจ้งเตือน

  const [formData, setFormData] = useState({
    project_name_th: "",
    project_name_eng: "",
    project_type: "",
    advisor_id: "",
    project_create_time: "",
    file: null,
  });

  const [projectTypes, setProjectTypes] = useState([]);
  const [advisors, setAdvisors] = useState([]);

  // 📌 โหลดประเภทโครงงานและอาจารย์ที่ปรึกษาจากฐานข้อมูล
  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectTypeRes = await api.get("/projects/project-types");
        setProjectTypes(projectTypeRes.data.data);

        const advisorsRes = await api.get("/projects/advisors");
        setAdvisors(advisorsRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        showSnackbar("เกิดข้อผิดพลาดในการโหลดข้อมูล", "error");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });

    try {
      await api.post("/projects/upload-old", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSnackbar("อัปโหลดโครงงานสำเร็จ!", "success");
      setFormData({
        project_name_th: "",
        project_name_eng: "",
        project_type: "",
        advisor_id: "",
        project_create_time: "",
        file: null,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      showSnackbar("เกิดข้อผิดพลาดในการอัปโหลด!", "error");
    }
  };

  return (
    <Container component={Paper} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        อัปโหลดโครงงานเก่า
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="ชื่อโครงงาน (ไทย)" name="project_name_th" fullWidth margin="normal" value={formData.project_name_th} onChange={handleChange} required />
        <TextField label="ชื่อโครงงาน (อังกฤษ)" name="project_name_eng" fullWidth margin="normal" value={formData.project_name_eng} onChange={handleChange} required />

        {/* 📌 ดึงประเภทโครงงานจากฐานข้อมูล */}
        <TextField label="ประเภทโครงงาน" name="project_type" select fullWidth margin="normal" value={formData.project_type} onChange={handleChange} required>
          {projectTypes.map((type) => (
            <MenuItem key={type.project_type_id} value={type.project_type_id}>
              {type.project_type_name}
            </MenuItem>
          ))}
        </TextField>

        {/* 📌 ดึงรายชื่ออาจารย์ที่ปรึกษาจากฐานข้อมูล */}
        <TextField label="อาจารย์ที่ปรึกษา" name="advisor_id" select fullWidth margin="normal" value={formData.advisor_id} onChange={handleChange} required>
          {advisors.map((advisor) => (
            <MenuItem key={advisor.teacher_id} value={advisor.teacher_id}>
              {advisor.teacher_name}
            </MenuItem>
          ))}
        </TextField>

        <TextField label="วันที่สร้าง" name="project_create_time" type="date" fullWidth margin="normal" value={formData.project_create_time} onChange={handleChange} required InputLabelProps={{ shrink: true }} />

        <input type="file" accept="application/pdf" onChange={handleFileChange} required />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          อัปโหลดโครงงาน
        </Button>
      </form>
    </Container>
  );
};

export default UploadProject;
