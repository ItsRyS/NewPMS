import { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import PropTypes from 'prop-types';

// สร้าง Context
const SnackbarContext = createContext();

// Provider สำหรับ ReusableSnackbar
export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // ฟังก์ชันแสดง Snackbar
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // ฟังก์ชันปิด Snackbar
  const handleClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

// กำหนด PropTypes
SnackbarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Hook สำหรับเรียกใช้ Snackbar
export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
