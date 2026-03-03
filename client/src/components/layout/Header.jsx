import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, useMediaQuery, useTheme, Menu, MenuItem } from '@mui/material';
import { ShoppingCart, Menu as MenuIcon, AccountCircle } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import { useCart } from '../../hooks/useCart';
import { useState } from 'react';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const isUserMenuOpen = Boolean(userMenuAnchorEl);
  const { user } = useSelector(state => state.auth);
  const { data: items = [] } = useCart();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleMobileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMobileMenuClose();
  };

  // Helper function to check if a route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar 
      position="sticky"
      sx={{ 
        bgcolor: 'background.paper',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(0,0,0,0.12)'
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {/* Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <ShoppingCart 
            sx={{ 
              color: 'primary.main', 
              fontSize: 28,
              mr: 1 
            }} 
          />
          <Typography 
            variant="h6" 
            component={Link} 
            to="/"
            sx={{ 
              textDecoration: 'none', 
              color: 'text.primary',
              fontWeight: 700,
              fontSize: isMobile ? '1.1rem' : '1.25rem',
              '&:hover': { color: 'primary.dark' }
            }}
          >
            E-Shop
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, ml: 'auto' }}>
          <Button 
            color="primary" 
            component={Link} 
            to="/products"
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              px: 2,
              py: 1,
              borderRadius: 2,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: isActiveRoute('/products') ? '100%' : '0%',
                height: '2px',
                bgcolor: 'primary.main',
                transition: 'width 0.3s ease'
              },
              '&:hover': { 
                bgcolor: 'rgba(63, 81, 181, 0.08)',
                '&::after': {
                  width: '100%'
                }
              }
            }}
          >
            Products
          </Button>
          {user ? (
            <>
              <Button 
                color="primary" 
                component={Link} 
                to="/orders"
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: isActiveRoute('/orders') ? '100%' : '0%',
                    height: '2px',
                    bgcolor: 'primary.main',
                    transition: 'width 0.3s ease'
                  },
                  '&:hover': { 
                    bgcolor: 'rgba(63, 81, 181, 0.08)',
                    '&::after': {
                      width: '100%'
                    }
                  }
                }}
              >
                My Orders
              </Button>
              {user.role === 'admin' && (
                <Button 
                  color="primary" 
                  component={Link} 
                  to="/admin/products"
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'rgba(63, 81, 181, 0.08)' }
                  }}
                >
                  Admin
                </Button>
              )}
            </>
          ) : (
            <>
              <Button 
                color="primary" 
                component={Link} 
                to="/login"
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(63, 81, 181, 0.08)' }
                }}
              >
                Login
              </Button>
              <Button 
                variant="outlined"
                color="primary" 
                component={Link} 
                to="/register"
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(63, 81, 181, 0.08)' }
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>

        {/* Mobile Menu Button */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', ml: 'auto' }}>
          <IconButton
            size="large"
            edge="start"
            color="primary"
            onClick={handleMobileMenuOpen}
            sx={{ 
              '&:hover': { bgcolor: 'rgba(63, 81, 181, 0.08)' }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Mobile Navigation Menu */}
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMobileMenuClose}
          onClick={handleMobileMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 180,
            }
          }}
        >
          <MenuItem onClick={() => handleNavigation('/products')}>
            <Typography variant="body2">Products</Typography>
          </MenuItem>
          {user ? (
            <>
              <MenuItem onClick={() => handleNavigation('/orders')}>
                <Typography variant="body2">Orders</Typography>
              </MenuItem>
              {user.role === 'admin' && (
                <MenuItem onClick={() => handleNavigation('/admin')}>
                  <Typography variant="body2">Admin</Typography>
                </MenuItem>
              )}
            </>
          ) : (
            <>
              <MenuItem onClick={() => handleNavigation('/login')}>
                <Typography variant="body2">Login</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('/register')}>
                <Typography variant="body2">Register</Typography>
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Cart Icon - Only show when user is logged in */}
        {user && (
          <IconButton
            color="primary"
            component={Link}
            to="/cart"
            sx={{ 
              ml: 2,
              '&:hover': { color: 'primary.dark' }
            }}
          >
            <Badge badgeContent={items.length} color="secondary">
              <ShoppingCart />
            </Badge>
          </IconButton>
        )}

        {/* User Menu */}
        {user && (
          <>
            <IconButton
              size="large"
              edge="end"
              color="primary"
              onClick={handleUserMenuOpen}
              sx={{ 
                ml: 1,
                '&:hover': { bgcolor: 'rgba(63, 81, 181, 0.08)' }
              }}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={userMenuAnchorEl}
              open={isUserMenuOpen}
              onClose={handleUserMenuClose}
              onClick={handleUserMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  minWidth: 120,
                  overflow: 'visible',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 20,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                    boxShadow: '0 -1px 2px 0 rgba(0,0,0,0.1)',
                  },
                }
              }}
            >
              <MenuItem onClick={handleLogout}>
                <Typography variant="body2" color="error.main">Logout</Typography>
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
