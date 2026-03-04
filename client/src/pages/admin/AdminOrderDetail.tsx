import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrder } from "../../hooks/useOrders";
import AdminSidebar from "../../components/layout/AdminSidebar";
import AdminAppBar from "../../components/layout/AdminAppBar";
import {
  Container,
  Typography,
  Grid,
  Box,
  Chip,
  Button,
  Paper,
  Divider,
  CircularProgress,
  useTheme,
  Toolbar,
} from "@mui/material";
import {
  ArrowBack,
  LocalShipping,
  CheckCircle,
  Pending,
  Home,
  Person,
  Phone,
  Email,
  CreditCard,
  Inventory,
} from "@mui/icons-material";
import { Order, OrderStatus } from "../../types";

interface StepData {
  label: string;
  icon: React.ReactNode;
}

const AdminOrderDetail: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: orderData, isLoading: loading, refetch } = useOrder(id || null);
  const order: Order | null = orderData?.data || null;
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const drawerWidth = 280;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Refetch order data when component mounts to ensure fresh data
  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  const getStatusColor = (
    status: OrderStatus,
  ): "warning" | "info" | "primary" | "success" | "default" => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Approved":
        return "info";
      case "Shipped":
        return "primary";
      case "Delivered":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return <Pending />;
      case "Approved":
        return <CheckCircle />;
      case "Shipped":
        return <LocalShipping />;
      case "Delivered":
        return <CheckCircle />;
      default:
        return <Pending />;
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return 0;
      case "Approved":
        return 1;
      case "Shipped":
        return 2;
      case "Delivered":
        return 3;
      default:
        return 0;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (!order) {
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
            Order not found
          </Typography>
        </Paper>
      </Container>
    );
  }

  const steps: StepData[] = [
    { label: "Order Placed", icon: <Pending /> },
    { label: "Order Approved", icon: <CheckCircle /> },
    { label: "Order Shipped", icon: <LocalShipping /> },
    { label: "Order Delivered", icon: <CheckCircle /> },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <AdminAppBar
        title="Order Details"
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
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
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
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Order Status
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 3,
                      }}
                    >
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

                {/* Order Progress Tracker */}
                <Grid item xs={12}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                      border: `1px solid ${theme.palette.divider}`,
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: 2,
                        }}
                      >
                        <LocalShipping sx={{ color: "white", fontSize: 20 }} />
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: "primary.main" }}
                      >
                        Order Progress
                      </Typography>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 4 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        {steps.map((step, index) => (
                          <Box
                            key={step.label}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              flex: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor:
                                  index <= getStepIndex(order.status)
                                    ? "primary.main"
                                    : "grey.300",
                                color:
                                  index <= getStepIndex(order.status)
                                    ? "white"
                                    : "text.secondary",
                                boxShadow:
                                  index <= getStepIndex(order.status) ? 3 : 1,
                                transition: "all 0.3s ease",
                                border: `2px solid ${index <= getStepIndex(order.status) ? theme.palette.primary.main : theme.palette.grey[300]}`,
                                transform:
                                  index <= getStepIndex(order.status)
                                    ? "scale(1.1)"
                                    : "scale(1)",
                              }}
                            >
                              {step.icon}
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                mt: 1,
                                textAlign: "center",
                                fontWeight:
                                  index <= getStepIndex(order.status)
                                    ? 600
                                    : 400,
                                color:
                                  index <= getStepIndex(order.status)
                                    ? "primary.main"
                                    : "text.secondary",
                                fontSize: "0.8rem",
                              }}
                            >
                              {step.label}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* Progress Line */}
                      <Box sx={{ position: "relative", mt: 2 }}>
                        <Box
                          sx={{
                            height: 4,
                            bgcolor: "grey.200",
                            borderRadius: 2,
                            position: "absolute",
                            top: 0,
                            left: 25,
                            right: 25,
                          }}
                        />
                        <Box
                          sx={{
                            height: 4,
                            bgcolor: "primary.main",
                            borderRadius: 2,
                            position: "absolute",
                            top: 0,
                            left: 25,
                            width: `${(getStepIndex(order.status) / (steps.length - 1)) * 100}%`,
                            transition: "width 0.5s ease-in-out",
                            boxShadow: `0 0 10px ${theme.palette.primary.main}40`,
                          }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Shipping Information */}
                <Grid item xs={12}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Shipping Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Person
                            sx={{ color: "text.secondary", fontSize: 20 }}
                          />
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {order.shippingDetails?.fullName}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Email
                            sx={{ color: "text.secondary", fontSize: 20 }}
                          />
                          <Typography variant="body1">
                            {order.shippingDetails?.email}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Phone
                            sx={{ color: "text.secondary", fontSize: 20 }}
                          />
                          <Typography variant="body1">
                            {order.shippingDetails?.phone}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1,
                          }}
                        >
                          <Home
                            sx={{
                              color: "text.secondary",
                              fontSize: 20,
                              mt: 0.5,
                            }}
                          />
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
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Payment Information
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <CreditCard
                        sx={{ color: "text.secondary", fontSize: 20 }}
                      />
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
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Order Items ({order.orderItems?.length || 0})
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {order.orderItems?.map((item, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "grey.50",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: "grey.100",
                              boxShadow: 1,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              flex: 1,
                            }}
                          >
                            {/* Product Image with Fallback */}
                            {item.product?.image ? (
                              <Box
                                component="img"
                                src={item.product.image}
                                alt={item.product.name}
                                sx={{
                                  width: 60,
                                  height: 60,
                                  objectFit: "cover",
                                  borderRadius: 2,
                                  border: "1px solid",
                                  borderColor: "divider",
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 60,
                                  height: 60,
                                  borderRadius: 2,
                                  bgcolor: "primary.light",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: "1px solid",
                                  borderColor: "divider",
                                }}
                              >
                                <Inventory
                                  sx={{
                                    color: "primary.contrastText",
                                    fontSize: 24,
                                  }}
                                />
                              </Box>
                            )}
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 600, mb: 0.5 }}
                              >
                                {item.product?.name || "Product"}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Quantity: {item.quantity} × $
                                {item.price?.toFixed(2) || "0.00"}
                              </Typography>
                              {item.product?.stock &&
                                item.product.stock < item.quantity && (
                                  <Chip
                                    label="Low stock"
                                    size="small"
                                    color="warning"
                                    sx={{
                                      mt: 0.5,
                                      fontSize: "0.7rem",
                                      height: 20,
                                    }}
                                  />
                                )}
                            </Box>
                          </Box>
                          <Typography
                            variant="h6"
                            color="primary.main"
                            sx={{ fontWeight: 700, ml: 2 }}
                          >
                            $
                            {(item.price * item.quantity)?.toFixed(2) || "0.00"}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
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
                  position: "sticky",
                  top: 20,
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Order Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Subtotal
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      ${order.totalPrice?.toFixed(2) || "0.00"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Shipping
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      FREE
                    </Typography>
                  </Box>
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
                    ${order.totalPrice?.toFixed(2) || "0.00"}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate("/admin/orders")}
                  sx={{
                    mt: 3,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Back to Orders
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminOrderDetail;
