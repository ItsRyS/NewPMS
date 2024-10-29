import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Navbar from '../components/Layout/Navbar';

const Home = () => {
  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ paddingTop: '80px' }}> {/* เพิ่ม padding-top */}
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to NewPMS
          </Typography>
          <Typography variant="body1">
            This is the home page of NewPMS, your personal management system. Explore the features and manage your tasks efficiently.
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default Home;
