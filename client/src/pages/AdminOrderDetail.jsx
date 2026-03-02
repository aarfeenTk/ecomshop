import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  Grid,
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Phone,
  Email,
  Home,
  CreditCard,
  LocalShipping,
  CheckCircle,
  Pending,
  Inventory
} from '@mui/icons-material';
import { getOrders, updateOrderStatus } from '../redux/slices/orderSlice';

const AdminOrderDetail = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { orders, loading } = useSelector(state => state.orders);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  useEffect(() => {
    if (orders.length > 0) {
      const foundOrder = orders.find(o => o._id === id);
      setOrder(foundOrder);
    }
  }, [orders, id]);

  const handleStatusUpdate = async (newStatus) => {
    if (window.confirm(`Are you sure you want to update order status to ${newStatus}?`)) {
      await dispatch(updateOrderStatus({ id, status: newStatus }));
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Pending />;
      case 'Approved':
        return <CheckCircle />;
      case 'Shipped':
        return <LocalShipping />;
      case 'Delivered':
        return <CheckCircle />;
      default:
        return <Pending />;
    }
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Approved':
        return 1;
      case 'Shipped':
        return 2;
      case 'Delivered':
        return 3;
      default:
        return 0;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusOptions = ['Pending', 'Approved', 'Shipped', 'Delivered'];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid rgba(0, 0, 0, 0.08)'
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Order not found
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/orders')}
            sx={{ mt: 2 }}
          >
            Back to Orders
          </Button>
        </Paper>
      </Container>
    );
  }

  const steps = [
    { label: 'Order Placed', icon: <Pending /> },
    { label: 'Order Approved', icon: <CheckCircle /> },
    { label: 'Order Shipped', icon: <LocalShipping /> },
    { label: 'Order Delivered', icon: <CheckCircle /> }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/admin/orders')}
        sx={{ mb: 3, textTransform: 'none' }}
      >
        Back to Orders
      </Button>

      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Order Details
      </Typography>

      <Grid container spacing={4}>
        {/* Order Information */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Order Status */}
            <Grid item xs={12}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Order Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Chip
                    icon={getStatusIcon(order.status)}
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="medium"
                    sx={{ fontWeight: 600 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Order #{order._id.slice(-8)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Placed on {formatDate(order.createdAt)}
                </Typography>
              </Paper>
            </Grid>

            {/* Order Status Update */}
            <Grid item xs={12}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Update Order Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {statusOptions.map((status) => (
                    <Button
                      key={status}
                      variant={order.status === status ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleStatusUpdate(status)}
                      sx={{ borderRadius: 2, mb: 1 }}
                    >
                      {status}
                    </Button>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Customer Information */}
            <Grid item xs={12}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Customer Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {order.shippingDetails?.fullName}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body1">
                        {order.shippingDetails?.email}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Phone sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body1">
                        {order.shippingDetails?.phone}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Home sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                      <Typography variant="body1">
                        {order.shippingDetails?.address}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Payment Information */}
            <Grid item xs={12}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Payment Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CreditCard sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {order.paymentMethod}
                  </Typography>
                </Box>
                {order.transactionReference && (
                  <Typography variant="body2" color="text.secondary">
                    Transaction Reference: {order.transactionReference}
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Order Items */}
            <Grid item xs={12}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Order Items ({order.orderItems?.length || 0})
                </Typography>
                <List>
                  {order.orderItems?.map((item, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: 'grey.50'
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Inventory sx={{ color: 'text.secondary' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.product?.name || 'Product'}
                        secondary={`Quantity: ${item.quantity} × $${item.price}`}
                        primaryTypographyProps={{ fontWeight: 600 }}
                        secondaryTypographyProps={{ color: 'text.secondary' }}
                      />
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700, ml: 'auto' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 2,
              position: 'sticky',
              top: 20
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Order ID
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                #{order._id.slice(-8)}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Order Date
              </Typography>
              <Typography variant="body1">
                {formatDate(order.createdAt)}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
                ${order.totalPrice?.toFixed(2) || '0.00'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Payment Method
              </Typography>
              <Typography variant="body1">
                {order.paymentMethod}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Order Progress
            </Typography>
            <Stepper activeStep={getStepIndex(order.status)} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    icon={step.icon}
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontWeight: 600
                      }
                    }}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/admin/orders')}
              sx={{
                mt: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Back to Orders List
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminOrderDetail;
