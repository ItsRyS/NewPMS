import dayjs from 'dayjs';
import api from './api';

export const fetchProjectsData = async () => {
  try {
    const response = await api.get('/projects');
    return response.data.data.map((project) => ({
      ...project,
      project_create_time: dayjs(project.project_create_time).format('DD/MM/YYYY'),
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};
