import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CssBaseline,
  FormLabel,
  FormControl,
  TextField,
  Typography,
  IconButton,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import HomeIcon from "@mui/icons-material/Home";
import * as z from 'zod';
import api from '../../services/api';
import { useSnackbar } from '../../components/ReusableSnackbar';

// ปรับแต่ง Layout
const RootContainer = styled(Box)({
  display: 'flex',
  height: '100vh',
});

const LeftContainer = styled(Box)({
  flex: 1,
  backgroundColor: '#F7941E', // สีส้มตามต้นฉบับ
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  textAlign: 'center',
  padding: '2rem',
});

const LogoImage = styled('img')({
  width: '580px',
  height: '580px',
  objectFit: 'contain',

});

const RightContainer = styled(Box)({
  flex: 1,
  backgroundColor: '#fff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem',
  position: 'relative', // ให้สามารถวางปุ่มย้อนกลับที่มุมขวาล่างได้
});

const FormContainer = styled(Box)({
  width: '100%',
  maxWidth: '400px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

const StyledButton = styled(Button)({
  backgroundColor: '#F7941E',
  '&:hover': { backgroundColor: '#e6851a' },
  fontSize: '1rem',
  padding: '0.75rem',
  borderRadius: '8px',
});

const BackButton = styled(IconButton)({
  position: 'absolute',
  bottom: '20px',
  right: '20px',
  color: '#000', // ปรับเป็นสี #F7941E ถ้าต้องการให้เข้ากับธีม
});

// Schema สำหรับตรวจสอบข้อมูล
const signInSchema = z.object({
  email: z.string().email('กรุณากรอกอีเมลที่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

export default function SignIn() {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();

  useEffect(() => {
    if (!sessionStorage.getItem('tabId')) {
      sessionStorage.setItem('tabId', `${Date.now()}-${Math.random()}`);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
      tabId: sessionStorage.getItem("tabId"),
    };

    try {
      // ตรวจสอบข้อมูลด้วย Zod
      signInSchema.parse(data);
      setErrors({});

      const response = await api.post("/auth/login", data);
      const { role } = response.data.user; // เปลี่ยนจาก response.data เป็น response.data.user

      // ทดสอบ session ทันทีหลัง login
      await api.get("/auth/check-session");

      showSnackbar("เข้าสู่ระบบสำเร็จ!", "success");
      setTimeout(() => {
        navigate(role === "teacher" ? "/adminHome" : "/studentHome");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      showSnackbar(
        error.response?.data?.error || "เข้าสู่ระบบไม่สำเร็จ",
        "error"
      );
    }
  };



  return (
    <>
      <CssBaseline />
      <RootContainer>
        {/* ด้านซ้าย: โลโก้ และชื่อสถาบัน */}
        <LeftContainer>
          <LogoImage src="/software.png" alt="IT Logo" />

        </LeftContainer>

        {/* ด้านขวา: ฟอร์มล็อกอิน */}
        <RightContainer>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            ระบบการจัดการโครงงาน
          </Typography>
          <Typography variant="body2" sx={{ color: 'gray', mb: 2 }}>
            กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
          </Typography>

          <FormContainer component="form" onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <TextField
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email || ''}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Password</FormLabel>
              <TextField
                id="password"
                name="password"
                type="password"
                placeholder="••••••"
                fullWidth
                required
                error={!!errors.password}
                helperText={errors.password || ''}
              />
            </FormControl>

            <StyledButton type="submit" variant="contained" fullWidth>
              เข้าสู่ระบบ
            </StyledButton>
            <Typography sx={{ textAlign: 'center', mt: 2 }}>
    ยังไม่มีบัญชี?{' '}
    <Link href="/signup" sx={{ color: '#F7941E', fontWeight: 'bold' }}>
      สมัครสมาชิกที่นี่
    </Link>
  </Typography>

          </FormContainer>

          {/* ปุ่มย้อนกลับที่ขวาล่าง */}
          <BackButton onClick={() => navigate('/')}>
            <HomeIcon fontSize="large" />
          </BackButton>
        </RightContainer>
      </RootContainer>
    </>
  );
}
