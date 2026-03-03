import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Avatar,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Store,
  ShoppingBag,
  Assignment,
  ChevronRight,
} from '@mui/icons-material';

interface AdminSidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  drawerWidth?: number;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobileOpen,
  handleDrawerToggle,
  drawerWidth = 280
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigation = (path: string): void => {
    navigate(path);
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const menuItems = [
    {
      text: 'Products',
      icon: <ShoppingBag />,
      path: '/admin/products',
    },
    {
      text: 'Orders',
      icon: <Assignment />,
      path: '/admin/orders',
    }
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <Store />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Admin Panel
          </Typography>
        </Box>
      </Toolbar>
      <Box sx={{ flex: 1, py: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              sx={{
                cursor: 'pointer',
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                transition: 'all 0.2s ease-in-out',
                bgcolor: location.pathname === item.path ? 'primary.light' : 'transparent',
                '&:hover': {
                  bgcolor: location.pathname === item.path ? 'primary.light' : 'action.hover',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <ListItemIcon sx={{
                color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  color: location.pathname === item.path ? 'primary.main' : 'text.primary'
                }}
              />
              {location.pathname === item.path && (
                <ChevronRight sx={{ color: 'primary.main' }} />
              )}
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: drawerWidth },
        flexShrink: { md: 0 }
      }}
    >
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default AdminSidebar;
