import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../redux/slices/productSlice';
import { logout } from '../redux/slices/authSlice';
import {
  Typography,
  Grid,
  Paper,
  Box,
  useTheme,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Breadcrumbs,
  Link,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Toolbar,
  AppBar,
  Badge,
  Divider,
  useMediaQuery
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Refresh,
  MoreVert,
  Visibility,
  ShoppingBag,
  Inventory,
  TrendingUp,
  FilterList,
  ArrowBack,
  Store,
  Menu as MenuIcon,
  Dashboard,
  Assignment,
  People,
  Settings,
  Logout,
  ChevronRight,
  Notifications,
  Person
} from '@mui/icons-material';

const AdminProductsList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const { products, loading } = useSelector(state => state.products);
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProductForMenu, setSelectedProductForMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const drawerWidth = 280;

  // Data fetching
  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  // Event handlers
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorElProfile(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteProduct(selectedProduct._id))
      .then(() => {
        setSnackbar({ open: true, message: 'Product deleted successfully', severity: 'success' });
        setDeleteDialogOpen(false);
        setSelectedProduct(null);
      })
      .catch(() => {
        setSnackbar({ open: true, message: 'Failed to delete product', severity: 'error' });
      });
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleMenuOpen = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProductForMenu(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProductForMenu(null);
  };

  const handleEditProduct = (product) => {
    navigate(`/admin/products/edit/${product._id}`);
    handleMenuClose();
  };

  const handleViewProduct = (product) => {
    navigate(`/admin/products/${product._id}`);
    handleMenuClose();
  };

  // Menu items
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

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return a.price - b.price;
      case 'stock':
        return b.stock - a.stock;
      case 'createdAt':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  // Get unique categories
  const categories = ['all', ...new Set(products.map(product => product.category).filter(Boolean))];

  // Pagination
  const paginatedProducts = sortedProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Drawer content
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
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              button
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  backgroundColor: 'primary.main',
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
              <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
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
              <ChevronRight sx={{ ml: 'auto', color: 'text.secondary' }} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{ justifyContent: 'flex-start' }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  // Loading skeleton
  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: rowsPerPage }).map((_, index) => (
        <Grid item xs={12} key={index}>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* App Bar */}
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
              Products
            </Typography>
            <Box sx={{ flex: 1 }} />
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <Person />
              </Avatar>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Side Drawer */}
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

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            minHeight: '100vh'
          }}
        >
          <Toolbar />
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Products
            </Typography>
            {renderSkeleton()}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
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
            Products Management
          </Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <Person />
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
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

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        
        <Box sx={{ p: 3 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link color="inherit" href="/admin/dashboard">
              Admin
            </Link>
            <Typography color="text.primary">Products</Typography>
          </Breadcrumbs>

          {/* Page Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Products Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/admin/products/create')}
              sx={{ borderRadius: 2 }}
            >
              Add Product
            </Button>
          </Box>

          {/* Search and Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Category"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="stock">Stock</MenuItem>
                  <MenuItem value="createdAt">Date Added</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => dispatch(getProducts())}
                sx={{ height: '40px' }}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <ShoppingBag />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {products.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Products
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.light' }}>
                      <Inventory />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {products.filter(p => p.stock > 0).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        In Stock
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.light' }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Value
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'error.light' }}>
                      <Store />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {products.filter(p => p.stock === 0).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Out of Stock
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Products Table */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {product.image ? (
                            <CardMedia
                              component="img"
                              image={product.image}
                              alt={product.name}
                              sx={{ width: 50, height: 50, borderRadius: 2, objectFit: 'cover' }}
                            />
                          ) : (
                            <Avatar sx={{ width: 50, height: 50, bgcolor: 'primary.light' }}>
                              <ShoppingBag />
                            </Avatar>
                          )}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.description?.substring(0, 50)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.category || 'Uncategorized'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        ${product.price?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {product.stock}
                          </Typography>
                          {product.stock === 0 && (
                            <Chip label="Out of Stock" size="small" color="error" />
                          )}
                          {product.stock > 0 && product.stock <= 10 && (
                            <Chip label="Low Stock" size="small" color="warning" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.stock > 0 ? 'Active' : 'Inactive'}
                          size="small"
                          color={product.stock > 0 ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => handleViewProduct(product)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, product)}
                            >
                              <MoreVert />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredProducts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorElProfile}
        open={Boolean(anchorElProfile)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { width: 200 }
        }}
      >
        <MenuItem onClick={() => handleViewProduct(selectedProductForMenu)}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleEditProduct(selectedProductForMenu)}>
          <Edit sx={{ mr: 1 }} />
          Edit Product
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteClick(selectedProductForMenu);
          handleMenuClose();
        }}>
          <Delete sx={{ mr: 1 }} />
          Delete Product
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminProductsList;
