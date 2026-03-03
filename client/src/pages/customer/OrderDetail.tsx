import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMyOrders } from "../../redux/slices/orderSlice";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Button,
  Paper,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  useTheme,
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
} from "@mui/icons-material";
import type { RootState, AppDispatch } from "../../redux/store";
import type { Order } from "../../types";

const OrderDetail: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading } = useSelector((state: RootState) => state.orders);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    dispatch(getMyOrders({}));
  }, [dispatch]);

  useEffect(() => {
    if (orders.length > 0) {
      const foundOrder = orders.find((o: Order) => o._id === id);
      setOrder(foundOrder || null);
    }
  }, [orders, id]);

  const getStatusColor = (
    status: string,
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

  const getStatusIcon = (status: string) => {
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const steps = ["Pending", "Approved", "Shipped", "Delivered"];

  const getActiveStep = (status: string): number => {
    return steps.indexOf(status);
  };

  if (loading || !order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/orders")}
        sx={{ mb: 3 }}
      >
        Back to Orders
      </Button>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          p: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Order #{order._id.slice(-8)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Placed on {formatDate(order.createdAt)}
            </Typography>
          </Box>
          <Chip
            icon={getStatusIcon(order.status)}
            label={order.status}
            color={getStatusColor(order.status)}
            sx={{ fontWeight: 600, px: 2, py: 0.5 }}
          />
        </Box>

        <Stepper
          activeStep={getActiveStep(order.status)}
          orientation="vertical"
          sx={{ mb: 4 }}
        >
          {steps.map((step, index) => (
            <Step key={step}>
              <StepLabel
                icon={getStatusIcon(step)}
                StepIconProps={{
                  color:
                    index <= getActiveStep(order.status)
                      ? "primary"
                      : "disabled",
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight={index <= getActiveStep(order.status) ? 600 : 400}
                >
                  {step}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  {index <= getActiveStep(order.status)
                    ? "Completed"
                    : "Pending"}
                </Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Order Items
        </Typography>

        {order.orderItems?.map((item, index) => (
          <Card key={index} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={8}>
                  <Typography variant="body1" fontWeight={500}>
                    {typeof item.product === "object"
                      ? item.product.name
                      : "Product"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantity: {item.quantity} × ${item.price}
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: "right" }}>
                  <Typography
                    variant="h6"
                    color="primary.main"
                    sx={{ fontWeight: 700 }}
                  >
                    ${(item.quantity * item.price).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Shipping Information
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Person sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body1">
                  {order.shippingDetails?.fullName}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Email sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body1">
                  {order.shippingDetails?.email}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Phone sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body1">
                  {order.shippingDetails?.phone}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Home sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body1">
                  {order.shippingDetails?.address}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Payment Information
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CreditCard sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body1">{order.paymentMethod}</Typography>
              </Box>
              {order.transactionReference && (
                <Typography variant="body2" color="text.secondary">
                  Transaction Ref: {order.transactionReference}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Total Amount
          </Typography>
          <Typography
            variant="h5"
            color="primary.main"
            sx={{ fontWeight: 700 }}
          >
            ${order.totalPrice?.toFixed(2)}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderDetail;
