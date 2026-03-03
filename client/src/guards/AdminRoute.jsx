import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdminUser = user.isAdmin === true || user.role === 'admin';
  if (!isAdminUser) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          p: 3,
          textAlign: 'center'
        }}
      >
        <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Access Denied
          </Typography>
          <Typography variant="body2">
            You don't have permission to access this admin area.
            Only administrators can view this page.
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ minWidth: 120 }}
          >
            Go to Home
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/products')}
            sx={{ minWidth: 120 }}
          >
            Browse Products
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/orders')}
            sx={{ minWidth: 120 }}
          >
            My Orders
          </Button>
        </Box>
      </Box>
    );
  }

  return children;
};

export default AdminRoute;
