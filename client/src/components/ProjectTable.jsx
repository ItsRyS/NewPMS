import { useState } from 'react';
import {
  DataGrid,
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector,
} from '@mui/x-data-grid';
import Pagination from '@mui/material/Pagination';
import {
  Box,
  Paper,
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
  Typography,
  Container,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import api from '../services/api';
import { useSnackbar } from './ReusableSnackbar';

// Custom pagination component to ensure visibility
function CustomPagination() {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <Box
      sx={{
        p: 1,
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        '& .MuiPaginationItem-root': {
          color: 'primary.main',
          fontWeight: 'medium',
        },
      }}
    >
      <Pagination
        color="primary"
        count={pageCount}
        page={page + 1}
        onChange={(event, value) => apiRef.current.setPage(value - 1)}
        size="medium"
        showFirstButton
        showLastButton
      />
    </Box>
  );
}

const ProjectTable = ({ rows, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('project_name_th');
  const [openDocument, setOpenDocument] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentError, setDocumentError] = useState(false);
  const [pageSize, setPageSize] = useState(5);
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleViewDocument = async (projectId) => {
    try {
      setDocumentError(false);
      const response = await api.get(
        `/project-release/complete-report/${projectId}`
      );

      if (response.data.success && response.data.documentPath) {
        const checkResponse = await fetch(response.data.documentPath, {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (!checkResponse.ok) {
          throw new Error('Document not accessible');
        }

        setDocumentUrl(response.data.documentPath);
        setOpenDocument(true);
      } else {
        throw new Error('Document path not found');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      setDocumentError(true);
      showSnackbar(
        'ไม่สามารถเปิดเอกสารได้ กรุณาตรวจสอบการตั้งค่า Supabase Storage',
        'error'
      );
    }
  };

  const handleCloseDocument = () => {
    setOpenDocument(false);
    setDocumentUrl('');
    setDocumentError(false);
  };

  const columns = [
    {
      field: 'project_name_th',
      headerName: 'ชื่อโครงงาน (TH)',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'project_name_eng',
      headerName: 'ชื่อโครงงาน (EN)',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'team_members',
      headerName: 'สมาชิกในทีม',
      flex: 1.5,
      minWidth: 150,
      renderCell: (params) => (
        <Box>
          {params.value?.split(', ').map((member, index) => (
            <Typography key={index} variant="body2">
              {member}
            </Typography>
          )) || 'ไม่มีสมาชิก'}
        </Box>
      ),
    },
    {
      field: 'project_advisor',
      headerName: 'ที่ปรึกษา',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'project_type',
      headerName: 'ประเภท',
      flex: 1,
      minWidth: 100,
    },
    {
      field: 'project_status',
      headerName: 'สถานะ',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Typography
          color={
            params.value === 'complete' ? 'success.main' : 'text.secondary'
          }
        >
          {params.value === 'complete' ? 'เสร็จสมบูรณ์' : 'กำลังดำเนินการ'}
        </Typography>
      ),
    },
    {
      field: 'project_create_time',
      headerName: 'วันที่สร้าง',
      flex: 1,
      minWidth: 100,
    },
    {
      field: 'actions',
      headerName: 'รายละเอียดเอกสาร',
      flex: 1,
      minWidth: 130,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          color={
            params.row.project_status === 'complete' ? 'primary' : 'inherit'
          }
          disabled={params.row.project_status !== 'complete'}
          onClick={() =>
            params.row.project_status === 'complete' &&
            handleViewDocument(params.row.project_id)
          }
          sx={{
            textTransform: 'none',
            fontSize: '0.8rem',
            height: '30px',
          }}
        >
          {params.row.project_status === 'complete'
            ? 'ดูเอกสาร'
            : 'กำลังดำเนินการ'}
        </Button>
      ),
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '90vh',
        width: '100%',
        py: 4,
      }}
    >
      {/* Search Panel - Separated from table */}
      <Container maxWidth="xl" sx={{ width: '100%', mb: 2 }}>
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            padding: 3,
            backgroundColor: '#fff',
            borderRadius: '8px',
            maxWidth: '1400px',
            mx: 'auto',
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="ค้นหาตาม"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                fullWidth
                size="small"
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
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Table Container */}
      <Container maxWidth="xl" sx={{ width: '100%' }}>
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            height: 500,
            overflow: 'hidden',
            backgroundColor: '#fff',
            borderRadius: '8px',
            maxWidth: '1400px',
            mx: 'auto',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              pagination
              components={{
                Pagination: CustomPagination,
              }}
              disableSelectionOnClick
              getRowId={(row) => row.project_id}
              density="comfortable"
              loading={loading}
              autoHeight={false}
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5',
                  color: '#000',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                },
                '& .MuiDataGrid-cell': {
                  fontSize: '0.9rem',
                  padding: '8px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
                '& .MuiDataGrid-row:nth-of-type(odd)': {
                  backgroundColor: '#fafafa',
                },
                '& .MuiDataGrid-footerContainer': {
                  backgroundColor: '#f5f5f5',
                  borderTop: '1px solid #e0e0e0',
                  padding: '8px 0',
                },
                border: 'none',
              }}
            />
          </Box>
        </Paper>
      </Container>

      <Dialog
        open={openDocument}
        onClose={handleCloseDocument}
        fullScreen={fullScreen}
        maxWidth={false}
        PaperProps={{
          sx: { width: '100%', height: fullScreen ? '100vh' : '90vh', m: 0 },
        }}
      >
        <DialogTitle>
          เอกสารฉบับสมบูรณ์
          <IconButton
            onClick={handleCloseDocument}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {documentUrl && !documentError ? (
            <iframe
              src={documentUrl}
              width="100%"
              height="100%"
              title="เอกสารฉบับสมบูรณ์"
              style={{ border: 'none' }}
              onError={() => {
                setDocumentError(true);
                showSnackbar(
                  'ไม่สามารถโหลดเอกสารได้ กรุณาลองใหม่อีกครั้ง',
                  'error'
                );
              }}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 3,
              }}
            >
              <Typography align="center" color="error" gutterBottom>
                {documentError ? 'ไม่สามารถโหลดเอกสารได้' : 'ไม่พบเอกสาร'}
              </Typography>
              {documentError && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCloseDocument}
                  sx={{ mt: 2 }}
                >
                  ปิด
                </Button>
              )}
            </Box>
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
