import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import { useSnackbar } from '../../components/ReusableSnackbar';
import api from '../../services/api';

const OldProject = () => {
  const [projects, setProjects] = useState([]);
  const showSnackbar = useSnackbar();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/project-release/old-projects');
      setProjects(response.data.data);
    } catch {
      showSnackbar('Failed to fetch projects', 'error');
    }
  };

  const handleDownload = (filePath) => {
    window.open(filePath, '_blank');
  };

  return (
    <Card sx={{ width: '100%', mt: 4 }}>
      <CardHeader title="Old Project Documents" />
      <CardContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name (Thai)</TableCell>
                <TableCell>Project Name (English)</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Document</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.project_id}>
                  <TableCell>{project.project_name_th}</TableCell>
                  <TableCell>{project.project_name_eng}</TableCell>
                  <TableCell>{project.project_type}</TableCell>
                  <TableCell>{new Date(project.project_create_time).getFullYear()}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleDownload(project.file_path)}
                      color="primary"
                      variant="text"
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default OldProject;