import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
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
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>

          <ProjectTable rows={projects} loading={loading} />

        <FooterHome />
      </Box>
    </>
  );
};

export default Home;
