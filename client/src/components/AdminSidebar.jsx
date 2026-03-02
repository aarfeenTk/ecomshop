import { useState } from 'react';
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

const AdminSidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth = 280 }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigation = (path) => {
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
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <ListItem
                key={item.text}
                button
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.main' : 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white'
                    },
                    '& .MuiListItemText-primary': {
                      color: 'white'
                    }
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'white' : 'text.secondary'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: 600
                    }
                  }}
                />
                <ChevronRight sx={{ ml: 'auto', color: isActive ? 'white' : 'text.secondary' }} />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
          }
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default AdminSidebar;
