import { useState, useEffect } from 'react';
import { Box, CssBaseline, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Link } from '@mui/material';
import api from '../../services/api'; // สำหรับการเชื่อมต่อ API



const Documentation = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/document');
        setDocuments(response.data);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };
    fetchDocuments();
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, minHeight: '100vh' }}
      >
        <Typography variant="h4" gutterBottom>
          Documentation
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.doc_id}>
                  <TableCell>{doc.doc_title}</TableCell>
                  <TableCell>{doc.doc_description}</TableCell>
                  <TableCell>{doc.uploaded_by}</TableCell>
                  <TableCell>{new Date(doc.upload_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Link href={`http://localhost:5000/${doc.doc_path}`} target="_blank" rel="noopener noreferrer">
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Documentation;
