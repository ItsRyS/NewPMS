import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
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
import api from '../services/api'; // ใช้ instance axios จาก api.js
import { useSnackbar } from './ReusableSnackbar';

const ProjectTable = ({ rows, loading }) => {
  const [searchTerm, setSearchTerm] = useState(''); // State สำหรับคำค้นหา
  const [searchField, setSearchField] = useState('project_name_th'); // Field สำหรับการค้นหา
  const [openDocument, setOpenDocument] = useState(false); // State สำหรับการเปิด Dialog
  const [documentUrl, setDocumentUrl] = useState(''); // URL ของเอกสาร
  const { showSnackbar } = useSnackbar(); // แสดง Snackbar สำหรับ Error
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm')); // ตรวจสอบขนาดหน้าจอ

  // ฟังก์ชันสำหรับดึงเอกสารและเปิด Dialog
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

  // กำหนดคอลัมน์ของ DataGrid
  const columns = [
    {
      field: 'project_name_th',
      headerName: 'ชื่อโครงการ (TH)',
      flex: 1.5, // ขยายพื้นที่มากขึ้น
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
      minWidth: 300, // เพิ่มความกว้างให้เหมาะสม
      renderCell: (params) =>
        params.row.team_members
          ? params.row.team_members
              .split(', ')
              .map((member, index) => <span key={index}>{member}</span>)
          : 'ไม่มีสมาชิก',
    },
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

  // ฟิลเตอร์ข้อมูลตามคำค้นหา
  const filteredRows = rows.filter((row) =>
    row[searchField]
      ?.toString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          width: '100%', // กำหนดความกว้างเต็มจอ
          maxWidth: '100%', // ยกเลิกการจำกัดความกว้าง
          overflow: 'hidden', // ซ่อน scroll bar ถ้าเกินขอบ
        }}
      >
        {/* Search Section */}
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

        {/* DataGrid Section */}
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={10} // จำกัดแถวต่อหน้าให้เหมาะสม
          rowsPerPageOptions={[10]} // ใช้ตัวเลือกแค่ 10 แถว
          disableSelectionOnClick
          getRowId={(row) => row.project_id}
          autoHeight // ปรับความสูงอัตโนมัติ
          loading={loading}
          density="comfortable" // เพิ่มระยะห่างให้แถวดูสบายตา
          sx={{
            '& .MuiDataGrid-root': {
              width: '100%', // ทำให้เต็มหน้าจอ
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: theme.palette.grey[200], // เพิ่มพื้นหลังให้หัวคอลัมน์
            },
            '& .MuiDataGrid-virtualScroller': {
              overflowX: 'hidden', // ซ่อน scroll bar แนวนอน
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.9rem', // ลดขนาดตัวอักษร
            },
          }}
        />
      </Paper>

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
    </>
  );
};

ProjectTable.propTypes = {
  rows: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default ProjectTable;
