import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getOrders, updateOrderStatus, clearError } from '../../redux/slices/orderSlice';
import { ORDER_STATUSES, PAYMENT_METHODS, FILTER_OPTIONS } from '../../utils/constants';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AdminAppBar from '../../components/layout/AdminAppBar';
import {
  Container,
  Typography,
  Paper,
  Box,
  useTheme,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  TextField
} from '@mui/material';
import {
  ShoppingBag,
  Person,
  LocalShipping,
  CheckCircle,
  Pending,
  Assignment
} from '@mui/icons-material';

const AdminOrders = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { orders, loading, error, updatingOrderId } = useSelector(state => state.orders);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOrderId, setFilterOrderId] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const drawerWidth = 280;

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ id: orderId, status: newStatus }))
      .unwrap()
      .then(() => {
        setSnackbar({ 
          open: true, 
          message: `Order status updated to ${newStatus}`, 
          severity: 'success' 
        });
      })
      .catch((error) => {
        setSnackbar({ 
          open: true, 
          message: error || 'Failed to update order status', 
          severity: 'error' 
        });
      });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' ||
                         order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (order.user?.email && order.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         order.shippingDetails.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === FILTER_OPTIONS.ALL || order.status === filterStatus;
    const matchesOrderId = filterOrderId === '' || order._id.toLowerCase().includes(filterOrderId.toLowerCase());
    const matchesPaymentMethod = filterPaymentMethod === FILTER_OPTIONS.ALL || order.paymentMethod === filterPaymentMethod;

    return matchesSearch && matchesStatus && matchesOrderId && matchesPaymentMethod;
  });

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminAppBar
        title="Orders Management"
        handleDrawerToggle={handleDrawerToggle}
        drawerWidth={drawerWidth}
      />

      <AdminSidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        drawerWidth={drawerWidth}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          marginTop: 10
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
          <ShoppingBag />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Orders Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track customer orders
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {orders.filter(o => o.status === ORDER_STATUSES.PENDING).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Orders
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${orders.filter(o => o.status === ORDER_STATUSES.PENDING).reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light', width: 56, height: 56 }}>
                  <Pending />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {orders.filter(o => o.status === ORDER_STATUSES.APPROVED).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved Orders
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${orders.filter(o => o.status === ORDER_STATUSES.APPROVED).reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light', width: 56, height: 56 }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {orders.filter(o => o.status === ORDER_STATUSES.SHIPPED).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Shipped Orders
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${orders.filter(o => o.status === ORDER_STATUSES.SHIPPED).reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                  <LocalShipping />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {orders.filter(o => o.status === ORDER_STATUSES.DELIVERED).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Delivered Orders
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${orders.filter(o => o.status === ORDER_STATUSES.DELIVERED).reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56 }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Filter by Status"
            >
              <MenuItem value={FILTER_OPTIONS.ALL}>All Orders</MenuItem>
              <MenuItem value={ORDER_STATUSES.PENDING}>Pending</MenuItem>
              <MenuItem value={ORDER_STATUSES.APPROVED}>Approved</MenuItem>
              <MenuItem value={ORDER_STATUSES.SHIPPED}>Shipped</MenuItem>
              <MenuItem value={ORDER_STATUSES.DELIVERED}>Delivered</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              label="Payment Method"
            >
              <MenuItem value={FILTER_OPTIONS.ALL}>All Methods</MenuItem>
              <MenuItem value={PAYMENT_METHODS.BANK_TRANSFER}>Bank Transfer</MenuItem>
              <MenuItem value={PAYMENT_METHODS.CASH_ON_DELIVERY}>Cash on Delivery</MenuItem>
            </Select>
          </FormControl>
        </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search by Order ID"
              value={filterOrderId}
              onChange={(e) => setFilterOrderId(e.target.value)}
              placeholder="Enter Order ID"
              InputProps={{
                startAdornment: <Assignment fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search Customer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, Email, or Full Name"
              InputProps={{
                startAdornment: <Person fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 3, 
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table sx={{ '& .MuiTableCell-root': { py: 2 } }}>
            <TableHead>
              <TableRow sx={{ 
                bgcolor: 'grey.50',
                '& .MuiTableCell-head': {
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }
              }}>
                <TableCell sx={{ pl: 3 }}>Order #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ pr: 3 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow 
                    key={order._id} 
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' },
                      '& .MuiTableCell-body': {
                        borderColor: 'divider',
                        fontSize: '0.875rem'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <TableCell sx={{ pl: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {order._id.substring(-8).toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.light' }}>
                          <Person fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {order.user?.name || order.shippingDetails.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.user?.email || order.shippingDetails.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        ${order.totalPrice.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.paymentMethod}
                        size="small"
                        color={order.paymentMethod === 'Bank Transfer' ? 'success' : 'warning'}
                        sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            disabled={updatingOrderId === order._id}
                            sx={{ fontSize: '0.8rem' }}
                          >
                            <MenuItem value="Pending">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Pending fontSize="small" />
                                Pending
                              </Box>
                            </MenuItem>
                            <MenuItem value="Approved">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircle fontSize="small" />
                                Approved
                              </Box>
                            </MenuItem>
                            <MenuItem value="Shipped">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocalShipping fontSize="small" />
                                Shipped
                              </Box>
                            </MenuItem>
                            <MenuItem value="Delivered">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircle fontSize="small" />
                                Delivered
                              </Box>
                            </MenuItem>
                          </Select>
                        </FormControl>
                        {updatingOrderId === order._id && (
                          <CircularProgress size={20} sx={{ ml: 1 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
        />
      </Paper>

    
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminOrders;
