import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Paper,
  Typography,
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

const ProjectTable = ({ rows, columns, loading }) => {
  const [openDocument, setOpenDocument] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm')); // เต็มหน้าจอเมื่ออยู่บนหน้าจอขนาดเล็ก

  const handleViewDocument = async (projectId) => {
    try {
      const response = await api.get(`/project-release/complete-report/${projectId}`);
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

  const documentsColumns = [
    ...columns,
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => {
        const isCompleted = params.row.project_status === 'complete'; // ตรวจสอบว่าโครงการสมบูรณ์หรือยัง
        const isOperate = params.row.project_status === 'operate'; // ตรวจสอบว่าอยู่ในสถานะ operate หรือไม่

        return (
          <Button
            variant="contained"
            color={isCompleted ? 'primary' : 'secondary'}
            size="medium"
            onClick={() => isCompleted && handleViewDocument(params.row.project_id)}
            disabled={isOperate} // ปิดปุ่มเมื่อสถานะเป็น operate
          >
            {isCompleted ? 'ดูเอกสาร' : 'กำลังดําเนินการ'}
          </Button>
        );
      },
    },
  ];


  return (
    <>
      <Paper elevation={3} sx={{ height: 500, p: 2 }}>
        {rows.length === 0 && !loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Typography variant="h6" color="textSecondary">
              ยังไม่มีโครงงาน
            </Typography>
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={documentsColumns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            getRowId={(row) => row.project_id}
          />
        )}
      </Paper>

      <Dialog
        open={openDocument}
        onClose={() => setOpenDocument(false)}
        fullScreen={fullScreen} // เต็มหน้าจอสำหรับหน้าจอเล็ก
        maxWidth={false} // ยกเลิกขีดจำกัดความกว้าง
        PaperProps={{
          sx: {
            width: '100%', // เต็มความกว้างหน้าจอ
            height: fullScreen ? '100vh' : '90vh', // เต็มหน้าจอเมื่อเป็นมือถือ และ 90% ของหน้าจอสำหรับเดสก์ท็อป
            m: 0, // ไม่มี margin
          },
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
  columns: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default ProjectTable;
