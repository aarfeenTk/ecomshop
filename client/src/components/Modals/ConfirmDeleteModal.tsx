import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Alert,
  Paper,
  CardMedia,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Delete,
  ShoppingBag,
  Warning,
  Info,
  Block,
  Inventory,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Product } from "../../types";

interface ConfirmDeleteProductModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
  loading?: boolean;
  activeOrdersCount?: number;
  hasActiveOrders?: boolean;
}

const ConfirmDeleteProductModal: React.FC<ConfirmDeleteProductModalProps> = ({
  open,
  onClose,
  onConfirm,
  product,
  loading = false,
  activeOrdersCount = 0,
  hasActiveOrders = false,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          border: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: hasActiveOrders ? "warning.light" : "error.50",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: hasActiveOrders ? "warning.main" : "error.main",
              width: 48,
              height: 48,
            }}
          >
            {hasActiveOrders ? <Warning /> : <Delete />}
          </Avatar>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: hasActiveOrders ? "warning.dark" : "error.dark",
              }}
            >
              {hasActiveOrders ? "Cannot Delete Product" : "Confirm Delete"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {hasActiveOrders
                ? "Product has active orders"
                : "This action cannot be undone"}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {hasActiveOrders ? (
          <Box>
            <Alert
              severity="warning"
              sx={{
                mb: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.warning.dark}`,
                "& .MuiAlert-message": {
                  fontSize: "0.95rem",
                },
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                This product cannot be deleted because it has{" "}
                {activeOrdersCount} active order(s).
              </Typography>
            </Alert>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: "grey.50",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}
              >
                Why can't I delete this product?
              </Typography>

              <List sx={{ mb: 2 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40, color: "warning.main" }}>
                    <Inventory />
                  </ListItemIcon>
                  <ListItemText
                    primary="Order History"
                    secondary="Deleting this product would break order history and make it impossible to track past orders."
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40, color: "warning.main" }}>
                    <Block />
                  </ListItemIcon>
                  <ListItemText
                    primary="Data Integrity"
                    secondary="Orders reference this product. Removing it would cause data inconsistencies."
                  />
                </ListItem>
              </List>

              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  <strong>Recommended:</strong> Mark the product as
                  "Unavailable" instead. This hides it from customers while
                  preserving order data.
                </Typography>
              </Alert>
            </Paper>
          </Box>
        ) : (
          <Box>
            <Alert
              severity="warning"
              sx={{
                mb: 3,
                borderRadius: 2,
                "& .MuiAlert-message": {
                  fontSize: "0.95rem",
                },
              }}
            >
              You are about to mark this product as unavailable. It will be
              removed from the store and customers won't be able to purchase it.
            </Alert>

            {product && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: "grey.50",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}
                >
                  {product.name}
                </Typography>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  {product.image ? (
                    <CardMedia
                      component="img"
                      image={product.image}
                      alt={product.name}
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        objectFit: "cover",
                        border: "1px solid rgba(0,0,0,0.1)",
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{ width: 60, height: 60, bgcolor: "primary.light" }}
                    >
                      <ShoppingBag />
                    </Avatar>
                  )}

                  <Box sx={{ textAlign: "left" }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Category:{" "}
                      <strong>{product.category || "Uncategorized"}</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Price: <strong>${product.price?.toFixed(2)}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Stock: <strong>{product.stock} units</strong>
                    </Typography>
                  </Box>
                </Box>

                {product.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: "background.paper",
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      fontStyle: "italic",
                    }}
                  >
                    "{product.description.substring(0, 150)}
                    {product.description.length > 150 ? "..." : ""}"
                  </Typography>
                )}
              </Paper>
            )}

            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
              <Typography variant="body2">
                Product will be marked as unavailable instead of being
                permanently deleted. This preserves order history.
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          p: 3,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: "grey.50",
          gap: 2,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          {hasActiveOrders ? "Close" : "Cancel"}
        </Button>
        {!hasActiveOrders && (
          <Button
            onClick={onConfirm}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              minWidth: 120,
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Mark as Unavailable"
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteProductModal;
