import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useCreateOrder } from "../../hooks/useOrders";
import { useCart } from "../../hooks/useCart";
import { checkoutSchema } from "../../validations/checkoutValidation";
import { RootState } from "../../redux/store";
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack,
  CreditCard,
  LocalShipping,
  Security,
  Email,
  Phone,
  Home,
  Person,
} from "@mui/icons-material";

const Checkout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: cartData } = useCart();
  const items = cartData?.data || [];
  const createOrderMutation = useCreateOrder();
  const loading = createOrderMutation.isPending;
  const user = useSelector((state: RootState) => state.auth.user);

  // Filter out unavailable products (soft-deleted or inactive)
  const availableItems = items.filter(
    (item: any) =>
      item.product && !item.product.isDeleted && item.product.active,
  );

  const [submitError, setSubmitError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(checkoutSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phone: "",
      address: "",
      paymentMethod: "Cash on Delivery",
      transactionReference: "",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const calculateSubtotal = () => {
    return availableItems.reduce((total, item) => {
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

  const onSubmit = async (data: any) => {
    if (availableItems.length === 0) {
      navigate("/cart");
      return;
    }

    createOrderMutation.mutate(data, {
      onSuccess: () => {
        navigate("/orders");
      },
      onError: (error: any) => {
        setSubmitError(
          error.response?.data?.message ||
            "Failed to create order. Please try again.",
        );
      },
    });
  };

  if (availableItems.length === 0) {
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
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            No available products in cart
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, mb: 3 }}
          >
            Some items in your cart may no longer be available.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/cart")}
            sx={{ mt: 2 }}
          >
            Back to Cart
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/cart")}
        sx={{ mb: 3, textTransform: "none" }}
      >
        Back to Cart
      </Button>

      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Checkout
      </Typography>

      <Grid container spacing={4}>
        {/* Shipping & Payment Form */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={1}
            sx={{
              p: 4,
              borderRadius: 3,
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 600, mb: 3 }}
            >
              Shipping Information
            </Typography>

            {submitError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {submitError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Controller
                    name="fullName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Full Name"
                        error={!!errors.fullName}
                        helperText={errors.fullName?.message}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email Address"
                        type="email"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Phone Number"
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Shipping Address"
                        error={!!errors.address}
                        helperText={errors.address?.message}
                        variant="outlined"
                        multiline
                        rows={3}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Home color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: 600, mb: 3 }}
              >
                Payment Method
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Controller
                    name="paymentMethod"
                    control={control}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        required
                        error={!!errors.paymentMethod}
                      >
                        <InputLabel>Payment Method</InputLabel>
                        <Select
                          {...field}
                          label="Payment Method"
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="Cash on Delivery">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <LocalShipping fontSize="small" />
                              Cash on Delivery
                            </Box>
                          </MenuItem>
                          <MenuItem value="Bank Transfer">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <CreditCard fontSize="small" />
                              Bank Transfer
                            </Box>
                          </MenuItem>
                        </Select>
                        {errors.paymentMethod && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 0.5, ml: 2 }}
                          >
                            {errors.paymentMethod.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                {paymentMethod === "Bank Transfer" && (
                  <Grid item xs={12}>
                    <Controller
                      name="transactionReference"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Transaction Reference"
                          error={!!errors.transactionReference}
                          helperText={errors.transactionReference?.message}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CreditCard color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                )}
              </Grid>

              <Box
                sx={{ mt: 4, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Security sx={{ color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  Your payment information is secure and encrypted
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  mt: 3,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `Place Order • $${calculateTotal().toFixed(2)}`
                )}
              </Button>
            </Box>
          </Paper>
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
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Order Items ({availableItems.length})
              </Typography>
              {availableItems.map((item: any) => (
                <Box
                  key={item._id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Qty: {item.quantity} × ${item.product.price}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>

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

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
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
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
