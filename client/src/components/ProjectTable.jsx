import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import api from '../services/api';
import { useSnackbar } from './ReusableSnackbar';

const ProjectTable = ({ rows, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('project_name_th');
  const [openDocument, setOpenDocument] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleViewDocument = async (projectId) => {
    try {
      const response = await api.get(
        `/project-release/complete-report/${projectId}`
      );
      if (response.data.success) {
        const fullDocumentUrl = response.data.documentPath.startsWith('/')
          ? `${window.location.origin}${response.data.documentPath}`
          : `${window.location.origin}/${response.data.documentPath}`;
        setDocumentUrl(fullDocumentUrl);
        setOpenDocument(true);
      } else {
        throw new Error('Document not found');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      showSnackbar('Unable to open document. Please try again.', 'error');
    }
  };

  const columns = [
    {
      field: 'project_name_th',
      headerName: 'ชื่อโครงการ (TH)',
      flex: 1.5,
      minWidth: 250,
    },
    {
      field: 'project_name_eng',
      headerName: 'ชื่อโครงการ (EN)',
      flex: 1.5,
      minWidth: 250,
    },
    {
      field: 'team_members',
      headerName: 'สมาชิกในทีม',
      flex: 1.2,
      minWidth: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {params.row.team_members
            ? params.row.team_members.split(', ').map((member, index) => (
                <Typography key={index} variant="body2">
                  {member}
                </Typography>
              ))
            : <Typography variant="body2" color="textSecondary">ไม่มีสมาชิก</Typography>}
        </Box>
      ),
    }
    ,
    {
      field: 'project_advisor',
      headerName: 'ที่ปรึกษา',
      flex: 1,
      minWidth: 200,
    },
    { field: 'project_type', headerName: 'ประเภท', flex: 0.8, minWidth: 150 },
    { field: 'project_status', headerName: 'สถานะ', flex: 0.5, minWidth: 100 },
    {
      field: 'project_create_time',
      headerName: 'วันที่สร้าง',
      flex: 0.5,
      minWidth: 100,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => {
        const isCompleted = params.row.project_status === 'complete';
        const isOperate = params.row.project_status === 'operate';
        return (
          <Button
            variant="contained"
            color={isCompleted ? 'primary' : 'secondary'}
            size="medium"
            onClick={() =>
              isCompleted && handleViewDocument(params.row.project_id)
            }
            disabled={isOperate}
          >
            {isCompleted ? 'ดูเอกสาร' : 'กำลังดำเนินการ'}
          </Button>
        );
      },
    },
  ];

  const filteredRows = rows.filter((row) =>
    row[searchField]
      ?.toString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Box
    sx={{
      display: 'flex',
      justifyContent: 'center', // จัดให้อยู่ตรงกลางแนวนอน
      alignItems: 'center', // จัดให้อยู่ตรงกลางแนวตั้ง
      minHeight: '100vh', // ครอบคลุมความสูงของหน้าจอ
      backgroundColor: '#f5f5f5', // เพิ่มสีพื้นหลัง

    }}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '100%', // ใช้พื้นที่เต็ม container
          width: '100%', // ครอบคลุมความกว้างทั้งหมด
          overflow: 'hidden', // ป้องกัน scroll bar เกินความจำเป็น
        }}
      >
        {/* ส่วนค้นหา */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="ค้นหาตาม"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              fullWidth
            >
              <MenuItem value="project_name_th">ชื่อโครงการ (TH)</MenuItem>
              <MenuItem value="project_name_eng">ชื่อโครงการ (EN)</MenuItem>
              <MenuItem value="project_advisor">ที่ปรึกษา</MenuItem>
              <MenuItem value="team_members">สมาชิกในทีม</MenuItem>
              <MenuItem value="project_type">ประเภท</MenuItem>
              <MenuItem value="project_status">สถานะ</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField
              placeholder="ค้นหาข้อมูล"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>

        {/* ตาราง */}
        <div style={{ flexGrow: 1, width: '100%' }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSize={10} // กำหนดจำนวนแถวต่อหน้า
            rowsPerPageOptions={[10]} // แสดงตัวเลือกสำหรับ 10 แถว
            disableSelectionOnClick
            getRowId={(row) => row.project_id}
            density="comfortable"
            loading={loading}
            sx={{
              width: '100%',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme.palette.grey[200], // พื้นหลังของ header
              },
              '& .MuiDataGrid-cell': {
                textOverflow: 'ellipsis', // ตัดข้อความยาวเกิน
                overflow: 'hidden',
                whiteSpace: 'nowrap', // ไม่ตัดข้อความขึ้นบรรทัดใหม่
              },
            }}
          />
        </div>
      </Paper>

      {/* Dialog สำหรับดูเอกสาร */}
      <Dialog
        open={openDocument}
        onClose={() => setOpenDocument(false)}
        fullScreen={fullScreen}
        maxWidth={false}
        PaperProps={{
          sx: { width: '100%', height: fullScreen ? '100vh' : '90vh', m: 0 },
        }}
      >
        <DialogTitle>
          Complete Report
          <IconButton
            aria-label="close"
            onClick={() => setOpenDocument(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {documentUrl ? (
            <iframe
              src={documentUrl}
              width="100%"
              height="100%"
              title="Complete Report"
              style={{ border: 'none' }}
            />
          ) : (
            <Typography>No document available</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );

};

ProjectTable.propTypes = {
  rows: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default ProjectTable;
