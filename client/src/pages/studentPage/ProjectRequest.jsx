import { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import api from '../../services/api';

const ProjectRequest = () => {
  const [projectNameTh, setProjectNameTh] = useState('');
  const [projectNameEng, setProjectNameEng] = useState('');
  const [projectType, setProjectType] = useState('');
  const [groupMembers, setGroupMembers] = useState(['']);
  const [advisors, setAdvisors] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState('');
  const [projectStatus, setProjectStatus] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [latestStatus, setLatestStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [advisorResponse, studentResponse, sessionResponse, projectTypeResponse] =
          await Promise.all([
            api.get('/teacher'),
            api.get('/users'),
            api.get('/auth/check-session'),
            api.get('/projects/project-types'),
          ]);
  
        console.log('Project Types Response:', projectTypeResponse.data); // เพิ่ม log ตรงนี้
  
        const studentUsers = studentResponse.data.filter(
          (user) => user.role === 'student'
        );
        setAdvisors(advisorResponse.data);
        setStudents(studentUsers);
        setProjectTypes(projectTypeResponse.data.data); // ตรวจสอบว่าข้อมูลถูกต้อง
  
        const { user_id } = sessionResponse.data.user;
        setGroupMembers([user_id]);
  
        const statusResponse = await api.get('/project-requests/status', {
          params: { studentId: user_id },
        });
        const statuses = statusResponse.data.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setProjectStatus(statuses);
  
        const hasApproved = statuses.some(
          (status) => status.status === 'approved'
        );
        setLatestStatus(hasApproved ? 'approved' : statuses[0]?.status || '');
  
        setCanSubmit(
          !(
            statuses.some((status) => status.status === 'pending') ||
            hasApproved
          )
        );
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!projectNameTh || !projectNameEng) {
      setError('กรุณากรอกชื่อโครงงานทั้งภาษาไทยและภาษาอังกฤษ');
      return;
    }
    if (!selectedAdvisor) {
      setError('กรุณาเลือกอาจารย์ที่ปรึกษา');
      return;
    }
    if (!projectType) {
      setError('กรุณาเลือกประเภทโครงงาน');
      return;
    }
    if (groupMembers.length === 0) {
      setError('กรุณาเพิ่มสมาชิกในกลุ่มอย่างน้อย 1 คน');
      return;
    }
    setError('');

    try {
      const sessionResponse = await api.get('/auth/check-session');
      const { user_id } = sessionResponse.data.user;

      const response = await api.post('/project-requests/create', {
        project_name: projectNameTh,
        project_name_eng: projectNameEng,
        project_type: projectType,
        groupMembers,
        advisorId: selectedAdvisor,
        studentId: user_id,
      });
      console.log('Request submitted:', response.data);

      const updatedStatus = await api.get('/project-requests/status', {
        params: { studentId: user_id },
      });
      const statuses = updatedStatus.data.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setProjectStatus(statuses);
      setLatestStatus(statuses[0]?.status || '');
      setCanSubmit(false);
    } catch (error) {
      console.error(
        'Error submitting request:',
        error.response?.data || error.message
      );
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      }
    }
  }, [
    projectNameTh,
    projectNameEng,
    projectType,
    groupMembers,
    selectedAdvisor,
  ]);

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
        width: '100%',
        flexDirection: { xs: 'column', md: 'row' },
        display: 'flex',
        gap: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{ padding: 4, borderRadius: 3, width: '100%', maxWidth: 800 }}
      >
        <Typography variant="h5" gutterBottom>
          Request a Project
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {!canSubmit && latestStatus === 'approved' && (
          <Alert severity="success" sx={{ marginBottom: 2 }}>
            ยินดีด้วย! โครงการของคุณได้รับการอนุมัติแล้ว
            กรุณาไปยังหน้าส่งเอกสารเพื่อส่งโครงการของคุณ
          </Alert>
        )}
        <TextField
          fullWidth
          label="ชื่อโครงงาน (ภาษาไทย)"
          value={projectNameTh}
          onChange={(e) => setProjectNameTh(e.target.value)}
          sx={{ marginBottom: 2 }}
          disabled={!canSubmit}
        />
        <TextField
          fullWidth
          label="ชื่อโครงงาน (ภาษาอังกฤษ)"
          value={projectNameEng}
          onChange={(e) => setProjectNameEng(e.target.value)}
          sx={{ marginBottom: 2 }}
          disabled={!canSubmit}
        />
        <TextField
          select
          fullWidth
          label="ประเภทโครงงาน"
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          sx={{ marginBottom: 2 }}
          disabled={!canSubmit}
        >
          {projectTypes.length > 0 ? (
            projectTypes.map((type) => (
              <MenuItem key={type.project_type_id} value={type.project_type_name}>
                {type.project_type_name}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>Loading...</MenuItem>
          )}
        </TextField>



        {/* Group Members */}
        {groupMembers.map((member, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
            <Grid item xs={10}>
              <TextField
                select
                fullWidth
                label={`Group Member ${index + 1}`}
                value={groupMembers[index] || ''}
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
                  onClick={() =>
                    setGroupMembers((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
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
            onClick={() => setGroupMembers([...groupMembers, ''])}
            sx={{ marginBottom: 2 }}
            disabled={!canSubmit}
          >
            Add Member
          </Button>
        )}
        {/* Advisor */}
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
        sx={{ padding: 4, borderRadius: 3, width: '100%', maxWidth: 800 }}
      >
        <Typography variant="h6" gutterBottom>
          Document Status
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {projectStatus.map((status, index) => (
            <Box
              key={status.request_id}
              sx={{
                padding: 2,
                borderRadius: 2,
                backgroundColor:
                  status.status === 'pending'
                    ? '#9e9e9e'
                    : status.status === 'approved'
                      ? '#4caf50'
                      : '#f44336',
                color: '#fff',
                border: index === 0 ? '2px solid #000' : 'none',
              }}
            >
              <Typography variant="body1">
                <strong>
                  {index === 0 ? 'Latest Request:' : ''} {status.project_name}
                </strong>
              </Typography>
              <Typography variant="body2">
                Status:{' '}
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
