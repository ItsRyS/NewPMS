import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  MenuItem,
  Grid,
  Chip,
  Paper,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  RemoveRedEyeTwoTone as ViewIcon,
  DeleteForeverTwoTone as DeleteIcon,
  RefreshTwoTone as RefreshIcon,
  ArrowDownwardTwoTone as ArrowDownIcon,
  ArrowUpwardTwoTone as ArrowUpIcon,
  AssignmentTurnedIn as ApprovedIcon,
  Assignment as AssignmentIcon,
  UploadFile as UploadIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useSnackbar } from '../../components/ReusableSnackbar';
import api from '../../services/api';
import { useSearchParams } from 'react-router-dom';
const UploadProjectDocument = () => {
  const [searchParams] = useSearchParams();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [file, setFile] = useState(null);
  const [approvedProject, setApprovedProject] = useState(null);
  const [documentHistory, setDocumentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({
    resubmit: false,
    cancel: false,
    view: false,
  });
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const showSnackbar = useSnackbar(); // ใช้ useSnackbar

  const handleApiError = useCallback(
    (error, defaultMessage) => {
      console.error('API Error:', error);
      const message =
        error.response?.data?.message || defaultMessage || 'เกิดข้อผิดพลาด';
      showSnackbar(message, 'error');
    },
    [searchParams, showSnackbar]
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const sessionResponse = await api.get('/auth/check-session');
      const studentId = sessionResponse.data.user.user_id;

      const [typesResponse, requestsResponse] = await Promise.all([
        api.get('/document-types/types'),
        api.get(`/project-requests/status?studentId=${studentId}`),
      ]);

      const allTypes = typesResponse.data;
      const approvedRequest = requestsResponse.data.data.find(
        (request) => request.status === 'approved'
      );

      setApprovedProject(approvedRequest || null);

      if (approvedRequest) {
        const [typesWithStatusResponse, historyResponse] = await Promise.all([
          api.get(
            `/project-documents/types-with-status?requestId=${approvedRequest.request_id}`
          ),
          api.get(
            `/project-documents/history?requestId=${approvedRequest.request_id}`
          ),
        ]);

        const typeMap = new Map();
        [...allTypes, ...typesWithStatusResponse.data].forEach((type) =>
          typeMap.set(type.type_id, type)
        );

        setDocumentTypes(Array.from(typeMap.values()));
        setDocumentHistory(historyResponse.data);
      } else {
        setDocumentTypes(allTypes);
        setDocumentHistory([]);
      }
    } catch (error) {
      handleApiError(error, 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  useEffect(() => {
    fetchData();
  }, [searchParams, fetchData]);

  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    return filePath; // URL is now already in correct format from backend
  };

  // In the handleViewDocument function:
  const handleViewDocument = (filePath) => {
    const url = getFileUrl(filePath);
    if (url) {
      setSelectedFilePath(url);
      setDialog((prev) => ({ ...prev, view: true }));
    } else {
      console.error('Invalid file path:', filePath);
      showSnackbar('ไม่สามารถเปิดเอกสารได้', 'error');
    }
  };
  const handleCloseDialog = (type) => {
    setDialog((prev) => ({ ...prev, [type]: false }));
    if (type === 'view') setSelectedFilePath('');
    if (type === 'resubmit') setFile(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const fileExtension = selectedFile?.name.split('.').pop().toLowerCase();
    const maxFileSize = 5 * 1024 * 1024;

    if (selectedFile && fileExtension === 'pdf') {
      if (selectedFile.size > maxFileSize) {
        showSnackbar('ขนาดไฟล์ต้องไม่เกิน 5MB', 'warning');
        setFile(null);
      } else {
        setFile(selectedFile);
      }
    } else {
      showSnackbar('กรุณาอัพโหลดไฟล์ PDF เท่านั้น', 'error');
      setFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      showSnackbar('กรุณาเลือกไฟล์สำหรับอัพโหลด', 'error');
      return;
    }
    const errorMessage = !file
      ? 'กรุณาเลือกไฟล์สำหรับอัพโหลด'
      : !selectedType
        ? 'กรุณาเลือกประเภทเอกสาร'
        : !approvedProject
          ? 'ยังไม่มีโครงการที่ได้รับการอนุมัติ ไม่สามารถอัพโหลดเอกสารได้'
          : null;

    if (errorMessage) {
      showSnackbar(errorMessage, 'error');
      return;
    }

    const selectedDocument = documentTypes.find(
      (type) => type.type_id === selectedType
    );

    if (selectedDocument?.status === 'approved') {
      showSnackbar(
        'เอกสารนี้ได้รับการอนุมัติแล้ว ไม่สามารถอัพโหลดซ้ำได้',
        'warning'
      );
      setSelectedType('');
      setFile(null);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type_id', selectedType);
    formData.append('request_id', approvedProject.request_id);
    console.log(
      'FormData:',
      formData.get('file'),
      formData.get('request_id'),
      formData.get('type_id')
    );

    try {
      setLoading(true);
      await api.post('/project-documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showSnackbar('อัพโหลดเอกสารสำเร็จ', 'success');
      setSelectedType('');
      setFile(null);
      fetchData();
    } catch (error) {
      console.error('Error uploading document:', error);
      showSnackbar(
        error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพโหลดเอกสาร',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubmission = async () => {
    try {
      setLoading(true);
      await api.delete(`/project-documents/${currentDocumentId}`);
      showSnackbar('Document submission canceled successfully.', 'success');
      fetchData();
      handleCloseDialog('cancel');
    } catch (error) {
      console.error('Error canceling submission:', error);
      showSnackbar('Failed to cancel document submission.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = async () => {
    if (!file) {
      showSnackbar('Please select a file to resubmit.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    console.log("📤 Resubmitting file:", file.name);

    try {
      setLoading(true);
      await api.post(
        `/project-documents/resubmit/${currentDocumentId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      showSnackbar('Document resubmitted successfully.', 'success');
      fetchData();
      handleCloseDialog('resubmit');
    } catch (error) {
      console.error(' Error resubmitting document:', error);
      showSnackbar('Failed to resubmit document.', 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleOpenDialog = (type, documentId = null) => {
    setCurrentDocumentId(documentId);
    setDialog((prev) => ({ ...prev, [type]: true }));
  };

  const sortedDocumentHistory = [...documentHistory].sort((a, b) =>
    sortOrder === 'desc'
      ? new Date(b.submitted_at) - new Date(a.submitted_at)
      : new Date(a.submitted_at) - new Date(b.submitted_at)
  );

  const mergeDocumentTypes = () => {
    const typeMap = new Map();
    documentTypes.forEach((type) => typeMap.set(type.type_id, type));
    return Array.from(typeMap.values());
  };

  const mergedDocumentTypes = mergeDocumentTypes();

  const getChipColor = (status) =>
    status === 'approved'
      ? 'success'
      : status === 'rejected'
        ? 'error'
        : status === 'returned'
          ? 'warning'
          : 'default';

  return (
    <>
      <Grid container spacing={4} alignItems="stretch" justifyContent="center">
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upload Document
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  label="Document Type"
                >
                  {documentTypes.map((type) => (
                    <MenuItem key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" component="label">
                Choose File
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            </Box>

            <Typography
              variant="body2"
              sx={{ mb: 2, color: file ? 'text.primary' : 'text.secondary' }}
            >
              {file ? `ไฟล์ที่เลือก: ${file.name}` : 'ยังไม่ได้เลือกเอกสาร'}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              fullWidth
              sx={{ mb: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Upload Document'}
            </Button>

            <Box>
              <Typography variant="h6" gutterBottom>
                เอกสารที่ผ่านการอนุมัติ
              </Typography>
              {mergedDocumentTypes.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No documents required.
                </Typography>
              ) : (
                <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                  {mergedDocumentTypes.map((type) => (
                    <Box
                      component="li"
                      key={type.type_id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color:
                          type.status === 'approved'
                            ? 'success.main'
                            : 'text.secondary',
                      }}
                    >
                      {type.status === 'approved' ? (
                        <ApprovedIcon sx={{ color: 'success.main' }} />
                      ) : (
                        <AssignmentIcon sx={{ color: 'text.secondary' }} />
                      )}
                      <Typography variant="body2">{type.type_name}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Submission History */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography
                variant="h6"
                sx={{ textAlign: 'center', fontWeight: 'bold' }}
              >
                ประวัติการส่งเอกสาร / ผลการตรวจ
              </Typography>
              <Button
                onClick={() =>
                  setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
                }
                startIcon={
                  sortOrder === 'desc' ? <ArrowDownIcon /> : <ArrowUpIcon />
                }
              >
                {sortOrder === 'desc' ? 'ใหม่ไปเก่า' : 'เก่าไปใหม่'}
              </Button>
            </Box>
            <TableContainer sx={{ maxHeight: 600, overflowY: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">
                      <strong>รายการ</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>จัดการเอกสาร</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>ผลการส่ง</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedDocumentHistory.map((doc) => (
                    <TableRow key={doc.document_id}>
                      <TableCell>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {doc.type_name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          วันที่ส่ง:{' '}
                          {new Date(doc.submitted_at).toLocaleString()}
                        </Typography>
                        {doc.status === 'rejected' && (
                          <Typography variant="body2" color="error">
                            หมายเหตุ: {doc.reject_reason}
                          </Typography>
                        )}
                        {doc.status === 'returned' && (
                          <Typography
                            variant="body2"
                            sx={{ color: 'warning.main' }}
                          >
                            มีเอกสารที่แก้ไขจากอาจารย์
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Tooltip title="ดูเอกสาร">
                            <span>
                              <Button
                                onClick={() =>
                                  handleViewDocument(doc.file_path)
                                }
                                color="inherit"
                                disabled={!doc.file_path}
                                sx={{ minWidth: 'auto', p: 0 }}
                              >
                                <ViewIcon />
                              </Button>
                            </span>
                          </Tooltip>

                          <Tooltip title="ส่งอีกครั้ง">
                            <span>
                              <Button
                                sx={{ minWidth: 'auto', p: 0 }}
                                onClick={() =>
                                  handleOpenDialog('resubmit', doc.document_id)
                                }
                                disabled={
                                  doc.status !== 'rejected' &&
                                  doc.status !== 'returned'
                                }
                              >
                                <RefreshIcon
                                  color={
                                    doc.status === 'rejected' ||
                                    doc.status === 'returned'
                                      ? 'warning'
                                      : 'disabled'
                                  }
                                />
                              </Button>
                            </span>
                          </Tooltip>

                          <Tooltip title="ยกเลิกการส่ง">
                            <span>
                              <Button
                                sx={{ minWidth: 'auto', p: 0 }}
                                onClick={() =>
                                  handleOpenDialog('cancel', doc.document_id)
                                }
                                disabled={doc.status !== 'pending'}
                              >
                                <DeleteIcon
                                  color={
                                    doc.status === 'pending'
                                      ? 'error'
                                      : 'disabled'
                                  }
                                />
                              </Button>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={
                            doc.status.charAt(0).toUpperCase() +
                            doc.status.slice(1)
                          }
                          color={getChipColor(doc.status)}
                          sx={{ width: '90px', textAlign: 'center' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={dialog.resubmit}
        onClose={() => handleCloseDialog('resubmit')}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            padding: '24px',
          },
        }}
      >
        <DialogTitle
          sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}
        >
          Resubmit Document
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', marginTop: '16px' }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
            sx={{
              backgroundColor: '#1976D2',
              '&:hover': {
                backgroundColor: '#1565C0',
              },
              fontSize: '1rem',
              padding: '12px 24px',
              borderRadius: '8px',
            }}
          >
            Choose File
            <input type="file" accept=".pdf" hidden onChange={handleFileChange} />
          </Button>
          {file && (
            <Typography
              variant="body1"
              sx={{
                marginTop: '16px',
                color: 'text.primary',
                fontWeight: '500',
              }}
            >
              Selected File: {file.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            padding: '16px',
            gap: '16px',
          }}
        >
          <Button
            onClick={() => handleCloseDialog('resubmit')}
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            sx={{
              borderRadius: '8px',
              padding: '8px 16px',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResubmit}
            variant="contained"
            color="primary"
            startIcon={<CheckIcon />}
            sx={{
              borderRadius: '8px',
              padding: '8px 16px',
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog.cancel} onClose={() => handleCloseDialog('cancel')}>
        <DialogTitle>Confirm Cancel</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณแน่ใจแล้วหรือว่าต้องการยกเลิกการส่งเอกสารนี้?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseDialog('cancel')} color="primary">
            ไม่
          </Button>
          <Button onClick={handleCancelSubmission} color="error">
            ใช่ ยกเลิกการส่ง
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialog.view}
        onClose={() => handleCloseDialog('view')}
        fullScreen={fullScreen}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { width: '100%', height: '100%' } }}
      >
        <IconButton
          onClick={() => handleCloseDialog('view')}
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent
          sx={{
            padding: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {selectedFilePath ? (
            <iframe
              src={selectedFilePath}
              width="100%"
              height="100%"
              title="Document Viewer"
              style={{ border: 'none' }}
            />
          ) : (
            <Typography variant="body2" color="textSecondary">
              Document not available.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
export default UploadProjectDocument;


