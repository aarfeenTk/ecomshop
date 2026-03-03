import { useEffect, useState, ChangeEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getOrders,
  updateOrderStatus,
  clearError,
} from "../../redux/slices/orderSlice";
import AdminSidebar from "../../components/layout/AdminSidebar";
import AdminAppBar from "../../components/layout/AdminAppBar";
import {
  Container,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  TextField,
  Toolbar,
} from "@mui/material";
import {
  Person,
  LocalShipping,
  CheckCircle,
  Pending,
} from "@mui/icons-material";
import type { RootState, AppDispatch } from "../../redux/store";
import type { Order } from "../../types";
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/utils/constants";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

const AdminOrders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error, updatingOrderId } = useSelector(
    (state: RootState) => state.orders,
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("all");
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const drawerWidth = 280;

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error as string, severity: "error" });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen);
  };

  const handleStatusUpdate = (
    orderId: string,
    newStatus: Order["status"],
  ): void => {
    dispatch(updateOrderStatus({ id: orderId, status: newStatus }))
      .unwrap()
      .then(() => {
        setSnackbar({
          open: true,
          message: "Order status updated successfully",
          severity: "success",
        });
      })
      .catch((err: unknown) => {
        setSnackbar({
          open: true,
          message: (err as string) || "Failed to update order status",
          severity: "error",
        });
      });
  };

  const handleChangePage = (_event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch =
      order.orderItems?.some(
        (item) =>
          typeof item.product === "object" &&
          item.product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || order._id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    const matchesPayment =
      filterPaymentMethod === "all" ||
      order.paymentMethod === filterPaymentMethod;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  if (loading && orders.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <AdminSidebar
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          drawerWidth={drawerWidth}
        />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
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
          minHeight: "100vh",
        }}
      >
        <Toolbar />

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
            Orders Management
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by order ID or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {ORDER_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment</InputLabel>
                <Select
                  value={filterPaymentMethod}
                  label="Payment"
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                >
                  <MenuItem value="all">All Payments</MenuItem>
                  {PAYMENT_METHODS.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                          No orders found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order: Order) => (
                      <TableRow key={order._id} hover>
                        <TableCell>#{order._id.slice(-8)}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: "primary.light",
                              }}
                            >
                              <Person fontSize="small" />
                            </Avatar>
                            <Typography variant="body2">
                              {order.shippingDetails?.fullName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{order.orderItems?.length || 0}</TableCell>
                        <TableCell
                          sx={{ fontWeight: 600, color: "primary.main" }}
                        >
                          ${order.totalPrice?.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(order.status)}
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.paymentMethod}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(order.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Update Status</InputLabel>
                            <Select
                              value={order.status}
                              label="Update Status"
                              onChange={(e) =>
                                handleStatusUpdate(
                                  order._id,
                                  e.target.value as Order["status"],
                                )
                              }
                              disabled={
                                updatingOrderId === order._id || loading
                              }
                            >
                              {ORDER_STATUSES.map((status) => (
                                <MenuItem key={status} value={status}>
                                  {status}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
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
            />
          </Paper>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminOrders;
