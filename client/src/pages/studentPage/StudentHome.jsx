import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectTable from '../../components/ProjectTable';
import api from '../../services/api';
import { fetchProjectsData } from '../../services/projectUtils';

function StudentHome() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get("/auth/check-session");
        if (!response.data.isAuthenticated) {
          navigate("/SignIn");
        }
      } catch {
        navigate("/SignIn");
      }
    };

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const data = await fetchProjectsData();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    fetchProjects();
  }, [navigate]);

  return (
    <ProjectTable rows={projects} loading={loading} />
  );
}

export default StudentHome;
