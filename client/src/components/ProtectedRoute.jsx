import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * ProtectedRoute (เช็กจาก tabId ใน sessionStorage)
 */
export default function ProtectedRoute({ children }) {
  const tabId = sessionStorage.getItem('tabId');

  // ถ้าไม่มี tabId -> ยังไม่ล็อกอิน -> Redirect ไปหน้า signin
  if (!tabId) {
    return <Navigate to="/signin" />;
  }

  // ถ้ามี tabId -> แสดง children (Layout / Page)
  return children;
}

// กำหนด PropTypes ให้ children
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
