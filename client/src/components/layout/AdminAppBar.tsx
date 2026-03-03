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
import { logout } from '../../redux/slices/authSlice';
import type { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';

interface AdminAppBarProps {
  title: string;
  handleDrawerToggle: () => void;
  handleProfileMenuOpen?: (event: React.MouseEvent<HTMLElement>) => void;
  drawerWidth?: number;
}

const AdminAppBar: React.FC<AdminAppBarProps> = ({
  title,
  handleDrawerToggle,
  handleProfileMenuOpen,
  drawerWidth = 280
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  const handleProfileMenuClose = (): void => {
    setAnchorElProfile(null);
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorElProfile(event.currentTarget);
    if (handleProfileMenuOpen) {
      handleProfileMenuOpen(event);
    }
  };

  const handleLogout = (): void => {
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
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user && (
              <>
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {user.name}
                </Typography>
                <IconButton onClick={handleProfileClick} sx={{ p: 0.5 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    <Person />
                  </Avatar>
                </IconButton>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorElProfile}
        open={Boolean(anchorElProfile)}
        onClose={handleProfileMenuClose}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={handleProfileClick}>
          <Person sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default AdminAppBar;
