import { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Paper,
} from '@mui/material';
import api from '../../services/api';
import { useSearchParams } from 'react-router-dom';
import { useSnackbar } from '../../components/ReusableSnackbar';

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
  const [hasPendingOrApproved, setHasPendingOrApproved] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [searchParams] = useSearchParams();
  const showSnackbar = useSnackbar();

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

        const studentUsers = studentResponse.data.filter(
          (user) => user.role === 'student'
        );
        setAdvisors(advisorResponse.data);
        setStudents(studentUsers);
        setProjectTypes(projectTypeResponse.data.data);

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

        const hasPendingOrApproved = statuses.some(
          (status) => status.status === 'pending' || status.status === 'approved'
        );
        setHasPendingOrApproved(hasPendingOrApproved);

        // ตรวจสอบว่าผู้ใช้เป็นเจ้าของคำร้องหรือไม่
        const isOwner = statuses.some(
          (status) => status.student_id === user_id
        );
        setIsOwner(isOwner);

        setCanSubmit(!hasPendingOrApproved);
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, showSnackbar]);

  const handleSubmit = useCallback(async () => {
    if (!projectNameTh || !projectNameEng) {
      showSnackbar('กรุณากรอกชื่อโครงงานทั้งภาษาไทยและภาษาอังกฤษ', 'error');
      return;
    }
    if (!selectedAdvisor) {
      showSnackbar('กรุณาเลือกอาจารย์ที่ปรึกษา', 'error');
      return;
    }
    if (!projectType) {
      showSnackbar('กรุณาเลือกประเภทโครงงาน', 'error');
      return;
    }
    if (groupMembers.length === 0) {
      showSnackbar('กรุณาเพิ่มสมาชิกในกลุ่มอย่างน้อย 1 คน', 'error');
      return;
    }

    try {
      const sessionResponse = await api.get('/auth/check-session');
      const { user_id } = sessionResponse.data.user;

      await api.post('/project-requests/create', {
        project_name: projectNameTh,
        project_name_eng: projectNameEng,
        project_type: projectType,
        groupMembers,
        advisorId: selectedAdvisor,
        studentId: user_id,
      });

      showSnackbar('ส่งคำร้องสำเร็จ', 'success');

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
      console.error('Error submitting request:', error);
      showSnackbar(
        error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งคำร้อง',
        'error'
      );
    }
  }, [
    projectNameTh,
    projectNameEng,
    projectType,
    groupMembers,
    selectedAdvisor,
    showSnackbar,
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
        {isOwner && latestStatus === 'approved' ? (
          <Box
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              p: 2,
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography>
              ยินดีด้วย! โครงการของคุณได้รับการอนุมัติแล้ว
              กรุณาไปยังหน้าส่งเอกสารเพื่อส่งโครงการของคุณ
            </Typography>
          </Box>
        ) : hasPendingOrApproved && !isOwner ? (
          <Box
            sx={{
              bgcolor: 'warning.main',
              color: 'white',
              p: 2,
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography>
              คุณเป็นสมาชิกของโครงงานอื่นที่อยู่ในสถานะ &quot;pending&quot; หรือ &quot;approved&quot; แล้ว
              ไม่สามารถส่งคำร้องใหม่ได้
            </Typography>
          </Box>
        ) : null}

        <TextField
          fullWidth
          label="ชื่อโครงงาน (ภาษาไทย)"
          value={projectNameTh}
          onChange={(e) => setProjectNameTh(e.target.value)}
          sx={{ marginBottom: 2 }}
          disabled={!canSubmit || hasPendingOrApproved}
        />
        <TextField
          fullWidth
          label="ชื่อโครงงาน (ภาษาอังกฤษ)"
          value={projectNameEng}
          onChange={(e) => setProjectNameEng(e.target.value)}
          sx={{ marginBottom: 2 }}
          disabled={!canSubmit || hasPendingOrApproved}
        />
        <TextField
          select
          fullWidth
          label="ประเภทโครงงาน"
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          sx={{ marginBottom: 2 }}
          disabled={!canSubmit || hasPendingOrApproved}
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
                disabled={!canSubmit || hasPendingOrApproved}
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
                  disabled={!canSubmit || hasPendingOrApproved}
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
            disabled={!canSubmit || hasPendingOrApproved}
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
          disabled={advisors.length === 0 || !canSubmit || hasPendingOrApproved}
          sx={{ marginBottom: 2 }}
        >
          {advisors.map((advisor) => (
            <MenuItem key={advisor.teacher_id} value={advisor.teacher_id}>
              {advisor.teacher_name}
            </MenuItem>
          ))}
        </TextField>
        {hasPendingOrApproved && !isOwner ? (
          <Typography variant="body1" color="error" sx={{ mt: 2 }}>
            คุณไม่สามารถส่งคำร้องใหม่ได้ เนื่องจากคุณเป็นสมาชิกของโครงงานอื่นอยู่แล้ว
          </Typography>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!canSubmit}
            sx={{ mt: 2 }}
          >
            Submit Request
          </Button>
        )}
      </Paper>

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