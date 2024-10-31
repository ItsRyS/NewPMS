
import { Box, Typography, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';

const Footer = () => {
  return (
    <Box
      component="Footer"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',  // Space between text and icons
        padding: '16px',
        backgroundColor: '#110f01',
        width: '100%',
        maxWidth: '100vw',
        position: 'fixed',  // Fix the position at the bottom
        bottom: 0,          // Position it at the bottom
        left: 0,
        boxSizing: 'border-box',
        zIndex: 98,
      }}
    >
      <Box>
        <Typography variant="body2" color="#f0f4f8">
          สงวนลิขสิทธิ์ © 2567 - ข้อมูลและเนื้อหาทั้งหมด - บริษัท ไลลาร์ เพอฟอร์ม จำกัด
        </Typography>
       
      </Box>
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <IconButton href="https://github.com" target="_blank" color="f0f4f8">
          <GitHubIcon />
        </IconButton>
        <IconButton href="mailto:ForzaLyraBelil@outlook.com" color="f0f4f8">
          <EmailIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Footer;
