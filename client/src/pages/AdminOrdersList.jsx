import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Visibility,
  Edit,
  LocalShipping,
  Person,
  Phone,
  Email,
  CreditCard
} from '@mui/icons-material';
import { getOrders, updateOrderStatus } from '../redux/slices/orderSlice';

const AdminOrdersList = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useSelector(state => state.orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (window.confirm(`Are you sure you want to update order status to ${newStatus}?`)) {
      await dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
    }
  };

  const handleView = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Approved':
        return 'info';
      case 'Shipped':
        return 'primary';
      case 'Delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const statusOptions = ['Pending', 'Approved', 'Shipped', 'Delivered'];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Order Management
      </Typography>

      {/* Search and Filter */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search orders by ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Filter"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">All Status</MenuItem>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              sx={{ borderRadius: 2 }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>
                  Order ID
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>
                  Customer
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>
                  Date
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>
                  Total
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <LocalShipping sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No orders found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search or filter criteria
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order._id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'grey.50'
                      }
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        #{order._id.slice(-8)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {order.user?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          {order.user?.email || 'No email'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell sx={{ py: 2, fontWeight: 600 }}>
                      ${order.totalPrice?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="View Order Details">
                          <IconButton
                            size="small"
                            onClick={() => handleView(order._id)}
                            sx={{ color: 'primary.main' }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update Status">
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              size="small"
                              sx={{ fontSize: '0.75rem' }}
                            >
                              {statusOptions.map((status) => (
                                <MenuItem key={status} value={status}>
                                  {status}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {filteredOrders.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredOrders.length} of {orders.length} orders
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
            }}
            sx={{ borderRadius: 2 }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default AdminOrdersList;
