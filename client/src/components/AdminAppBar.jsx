import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
} from '@mui/icons-material';
import { logout } from '../redux/slices/authSlice';

const AdminAppBar = ({
  title,
  handleDrawerToggle,
  handleProfileMenuOpen,
  drawerWidth = 280
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorElProfile, setAnchorElProfile] = useState(null);

  const handleProfileMenuClose = () => {
    setAnchorElProfile(null);
  };

  const handleProfileClick = (event) => {
    setAnchorElProfile(event.currentTarget);
    if (handleProfileMenuOpen) {
      handleProfileMenuOpen(event);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    handleProfileMenuClose();
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton
            color="inherit"
            onClick={handleProfileClick}
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <Person />
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorElProfile}
        open={Boolean(anchorElProfile)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </>
  );
};

export default AdminAppBar;
