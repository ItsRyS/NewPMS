
import { Outlet } from 'react-router-dom';
import SideStudent from '../components/SideStudent'; // ปรับเส้นทางการ import ตามตำแหน่งไฟล์ SideStudent
import { Box } from '@mui/material';

const LayoutStudent = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <SideStudent />
      
      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <header>
          <h1>Header Bar</h1>
        </header>
        <hr />
        
        {/* Render nested routes */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default LayoutStudent;
