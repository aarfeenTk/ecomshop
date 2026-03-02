import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Paper,
  Divider,
  Chip,
  useTheme,
  CircularProgress,
  TextField
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  ArrowBack
} from '@mui/icons-material';
import {
  updateCartItem,
  removeFromCart,
  getCart
} from '../redux/slices/cartSlice';

const Cart = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(getCart());
  }, [dispatch, user, navigate]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateCartItem({ productId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleQuantityInputChange = (productId, value) => {
    // Allow empty input or valid numbers
    if (value === '' || value === '-') {
      return; // Don't update while user is typing
    }
    
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity >= 1) {
      dispatch(updateCartItem({ productId, quantity }));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 50 ? 0 : 10;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (items.length === 0) {
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
          <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Looks like you haven't added any products to your cart yet.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<ArrowBack />}
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
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map((item) => (
              <Card
                key={item._id}
                elevation={1}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3} alignItems="center">
                    {/* Product Image */}
                    <Grid item xs={12} sm={3}>
                      <CardMedia
                        component="img"
                        image={item.product.image || 'https://via.placeholder.com/100x100?text=Product'}
                        alt={item.product.name}
                        sx={{
                          width: '100%',
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 2
                        }}
                      />
                    </Grid>

                    {/* Product Details */}
                    <Grid item xs={12} sm={5}>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            lineHeight: 1.3
                          }}
                        >
                          {item.product.name}
                        </Typography>
                        <Typography
                          variant="h6"
                          color="primary.main"
                          sx={{ fontWeight: 700 }}
                        >
                          ${item.product.price}
                        </Typography>
                        {item.product.stock < item.quantity && (
                          <Chip
                            label="Insufficient stock"
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                    </Grid>

                    {/* Quantity Controls */}
                    <Grid item xs={12} sm={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1
                          }}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <TextField
                          size="small"
                          type="number"
                          defaultValue={item.quantity}
                          onBlur={(e) => handleQuantityInputChange(item.product._id, e.target.value)}
                          inputProps={{
                            min: 1,
                            max: item.product.stock,
                            style: { 
                              textAlign: 'center',
                              width: '60px',
                              fontSize: '16px',
                              fontWeight: 600
                            }
                          }}
                          sx={{
                            width: '60px',
                            minWidth: '60px',
                            maxWidth: '60px',
                            '& .MuiOutlinedInput-input': {
                              textAlign: 'center',
                              padding: '6px',
                              fontSize: '16px',
                              fontWeight: 600
                            },
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1
                            }
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1
                          }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>

                    {/* Item Total and Remove */}
                    <Grid item xs={12} sm={2}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, mb: 1 }}
                        >
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveItem(item.product._id)}
                          color="error"
                          sx={{ ml: 'auto' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
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
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1" color="text.secondary">
                  Subtotal
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  ${calculateSubtotal().toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1" color="text.secondary">
                  Shipping
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {calculateShipping() === 0 ? 'FREE' : `$${calculateShipping().toFixed(2)}`}
                </Typography>
              </Box>
              
              {calculateSubtotal() < 50 && (
                <Typography variant="body2" color="primary.main" sx={{ mb: 2 }}>
                  Add ${(50 - calculateSubtotal()).toFixed(2)} more for free shipping!
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Total
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => navigate('/checkout')}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              Proceed to Checkout
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/products"
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                mt: 2
              }}
            >
              Continue Shopping
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;
