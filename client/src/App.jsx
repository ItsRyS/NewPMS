import AppRoutes from './AppRoutes/AppRoutes';
import { CssBaseline, Box } from '@mui/material';
import './Css/scrollbar.css';
function App() {
  return (
    <>
      <CssBaseline />
      <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
        <AppRoutes />
      </Box>
    </>
  );
}

export default App;