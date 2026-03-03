import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { getMyOrders } from '../../redux/slices/orderSlice';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Grid,
  Paper,
  CircularProgress,
  Divider,
  useTheme,
  IconButton
} from '@mui/material';
import {
  Visibility,
  LocalShipping,
  CheckCircle,
  Pending,
  ShoppingCart,
} from '@mui/icons-material';

const Orders = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(state => state.orders);

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

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
        return <Pending fontSize="small" />;
      case 'Approved':
        return <CheckCircle fontSize="small" />;
      case 'Shipped':
        return <LocalShipping fontSize="small" />;
      case 'Delivered':
        return <CheckCircle fontSize="small" />;
      default:
        return <Pending fontSize="small" />;
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 0 }}>
          My Orders
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          View and track your orders
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 , mb:0}}>
        My Orders
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and track your orders
      </Typography>

      {orders.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid rgba(0, 0, 0, 0.08)'
          }}
        >
          <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            You haven't placed any orders yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Start shopping to see your orders here
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/products"
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} sm={6} md={4} key={order._id}>
              <Card
                elevation={1}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                        sx={{ fontWeight: 500 }}
                      >
                        Order #{order._id.slice(-8)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(order.createdAt)}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Amount
                    </Typography>
                    <Typography
                      variant="h6"
                      color="primary.main"
                      sx={{ fontWeight: 700 }}
                    >
                      ${order.totalPrice.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Items ({order.orderItems?.length || 0})
                    </Typography>
                    <Box sx={{ maxHeight: 80, overflow: 'hidden' }}>
                      {order.orderItems?.slice(0, 2).map((item, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          sx={{
                            fontSize: '0.875rem',
                            lineHeight: 1.4,
                            color: 'text.secondary'
                          }}
                        >
                          • {item.product?.name || 'Product'} × {item.quantity}
                        </Typography>
                      ))}
                      {order.orderItems?.length > 2 && (
                        <Typography variant="body2" color="text.secondary">
                          ...and {order.orderItems.length - 2} more
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    component={RouterLink}
                    to={`/orders/${order._id}`}
                    endIcon={<Visibility />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Orders;
