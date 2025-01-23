import { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import NavbarHome from '../../components/NavHome';
import FooterHome from '../../components/FooterHome';
import ProjectTable from '../../components/ProjectTable';
import { fetchProjectsData } from '../../services/projectUtils';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const data = await fetchProjectsData();
      setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  return (
    <>
      <NavbarHome />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Container sx={{ py: 4, marginTop: '70px', flex: 1 }}>
          <ProjectTable rows={projects} loading={loading} />
        </Container>
        <FooterHome />
      </Box>
    </>
  );
};

export default Home;
