import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
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
  TextField,
} from "@mui/material";
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  ArrowBack,
} from "@mui/icons-material";
import {
  useCart,
  useUpdateCartItem,
  useRemoveFromCart,
} from "../../hooks/useCart";
import { CartItem, Product } from "../../types";
import { RootState } from "../../redux/store";

const Cart: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: cartData, isLoading: loading } = useCart();
  const items: CartItem[] = cartData?.data || [];
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateCartItemMutation.mutate({ productId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (productId: string) => {
    setDeletingProductId(productId);
    removeFromCartMutation.mutate(productId, {
      onSettled: () => {
        setDeletingProductId(null);
      },
    });
  };

  const handleQuantityInputChange = (productId: string, value: string) => {
    if (value === "" || value === "-") {
      return;
    }

    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity >= 1) {
      updateCartItemMutation.mutate({ productId, quantity });
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      // Exclude unavailable products from calculation
      if (!item.product || item.product.isDeleted || !item.product.active)
        return total;
      return total + item.product.price * item.quantity;
    }, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 50 ? 0 : 10;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  // Get only available items for checkout
  const getAvailableItems = () => {
    return items.filter(
      (item) => item.product && !item.product.isDeleted && item.product.active,
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
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
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid rgba(0, 0, 0, 0.08)",
          }}
        >
          <ShoppingCart sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
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
              textTransform: "none",
              fontWeight: 600,
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
        Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {items.map((item) => {
              const isProductUnavailable =
                !item.product || item.product.isDeleted || !item.product.active;

              return (
                <Card
                  key={item._id}
                  elevation={1}
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: theme.shadows[4],
                    },
                    opacity: isProductUnavailable ? 0.7 : 1,
                    backgroundColor: isProductUnavailable
                      ? "grey.50"
                      : "background.paper",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                      {/* Product Image */}
                      <Grid item xs={12} sm={3}>
                        <CardMedia
                          component="img"
                          image={
                            item.product?.image ||
                            "https://via.placeholder.com/100x100?text=Product"
                          }
                          alt={item.product?.name || "Unavailable Product"}
                          sx={{
                            width: "100%",
                            height: 100,
                            objectFit: "cover",
                            borderRadius: 2,
                            filter: isProductUnavailable
                              ? "grayscale(100%)"
                              : "none",
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
                              lineHeight: 1.3,
                              color: isProductUnavailable
                                ? "text.secondary"
                                : "text.primary",
                            }}
                          >
                            {item.product?.name ||
                              "Product No Longer Available"}
                          </Typography>
                          {isProductUnavailable ? (
                            <Chip
                              label="No longer available"
                              size="small"
                              color="error"
                              sx={{ mt: 1 }}
                            />
                          ) : (
                            <Typography
                              variant="h6"
                              color="primary.main"
                              sx={{ fontWeight: 700 }}
                            >
                              ${item.product?.price ?? 0}
                            </Typography>
                          )}
                          {!isProductUnavailable &&
                            (item.product?.stock ?? 0) < item.quantity && (
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
                        {isProductUnavailable ? (
                          <Typography
                            variant="body2"
                            color="error"
                            sx={{ fontWeight: 600 }}
                          >
                            Unavailable
                          </Typography>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              marginTop: 5,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleQuantityChange(
                                  item.product!._id,
                                  item.quantity - 1,
                                )
                              }
                              disabled={item.quantity <= 1}
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                              }}
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <TextField
                              key={`quantity-${item._id}-${item.quantity}`}
                              size="small"
                              type="number"
                              defaultValue={item.quantity}
                              onBlur={(e) =>
                                handleQuantityInputChange(
                                  item.product!._id,
                                  e.target.value,
                                )
                              }
                              inputProps={{
                                min: 1,
                                max: item.product!.stock,
                                style: {
                                  textAlign: "center",
                                  width: "60px",
                                  fontSize: "16px",
                                  fontWeight: 600,
                                },
                              }}
                              sx={{
                                width: "60px",
                                minWidth: "60px",
                                maxWidth: "60px",
                                "& .MuiOutlinedInput-input": {
                                  textAlign: "center",
                                  padding: "6px",
                                  fontSize: "16px",
                                  fontWeight: 600,
                                },
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 1,
                                },
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleQuantityChange(
                                  item.product!._id,
                                  item.quantity + 1,
                                )
                              }
                              disabled={item.quantity >= item.product!.stock}
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                              }}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Grid>

                      {/* Item Total and Remove */}
                      <Grid item xs={12} sm={2}>
                        <Box sx={{ textAlign: "right" }}>
                          {!isProductUnavailable && (
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 600, mb: 1 }}
                            >
                              $
                              {(item.product!.price * item.quantity).toFixed(2)}
                            </Typography>
                          )}
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleRemoveItem(item.product?._id || item._id)
                            }
                            color="error"
                            disabled={
                              deletingProductId === item.product?._id ||
                              deletingProductId === item._id
                            }
                            sx={{ ml: "auto" }}
                          >
                            {deletingProductId === item.product?._id ||
                            deletingProductId === item._id ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <Delete fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 2,
              position: "sticky",
              top: 20,
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body1" color="text.secondary">
                  Subtotal
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  ${calculateSubtotal().toFixed(2)}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body1" color="text.secondary">
                  Shipping
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {calculateShipping() === 0
                    ? "FREE"
                    : `$${calculateShipping().toFixed(2)}`}
                </Typography>
              </Box>

              {calculateSubtotal() < 50 && (
                <Typography variant="body2" color="primary.main" sx={{ mb: 2 }}>
                  Add ${(50 - calculateSubtotal()).toFixed(2)} more for free
                  shipping!
                </Typography>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Total
              </Typography>
              <Typography
                variant="h6"
                color="primary.main"
                sx={{ fontWeight: 700 }}
              >
                ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => {
                // Only proceed to checkout if there are available items
                const availableItems = getAvailableItems();
                if (availableItems.length === 0) {
                  alert(
                    "Your cart only contains unavailable products. Please add available products to proceed.",
                  );
                  return;
                }
                navigate("/checkout");
              }}
              disabled={getAvailableItems().length === 0}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
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
                textTransform: "none",
                fontWeight: 600,
                mt: 2,
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
