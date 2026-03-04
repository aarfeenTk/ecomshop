import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts, useDeleteProduct } from "../../hooks/useProducts";
import {
  Typography,
  Grid,
  Paper,
  Box,
  useTheme,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Menu as MenuIcon,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Tooltip,
  Toolbar,
  SelectChangeEvent,
} from "@mui/material";
import {
  Search,
  Add,
  Edit,
  Delete,
  ShoppingBag,
  Inventory,
  TrendingUp,
  Store,
} from "@mui/icons-material";
import ConfirmDeleteProductModal from "../../components/Modals/ConfirmDeleteModal";
import AdminSidebar from "../../components/layout/AdminSidebar";
import AdminAppBar from "../../components/layout/AdminAppBar";
import { Product } from "../../types";

interface ProductsData {
  data: Product[];
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "warning" | "error" | "info";
}

interface DeleteLoadingState {
  [key: string]: boolean;
}

const AdminProductsList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: productsData, isLoading: loading } = useProducts(1, 1000);
  const products: Product[] = productsData?.data || [];
  const deleteProductMutation = useDeleteProduct();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const drawerWidth = 280;

  const deleteLoading: DeleteLoadingState = {
    [selectedProduct?._id || ""]: deleteProductMutation.isPending,
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    const productId = selectedProduct?._id || "";
    deleteProductMutation.mutate(productId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedProduct(null);
        setSnackbar({
          open: true,
          message: "Product marked as unavailable (soft deleted)",
          severity: "success",
        });
      },
      onError: (error: any) => {
        setDeleteDialogOpen(false);
        setSelectedProduct(null);

        // Show appropriate message
        const activeOrdersCount = error.response?.data?.activeOrdersCount || 0;
        if (activeOrdersCount > 0) {
          setSnackbar({
            open: true,
            message: `Cannot delete: Product has ${activeOrdersCount} active order(s). Consider marking as unavailable instead.`,
            severity: "warning",
          });
        } else {
          setSnackbar({
            open: true,
            message:
              error.response?.data?.message || "Failed to delete product",
            severity: "error",
          });
        }
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    navigate(`/admin/products/edit/${product._id}`);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price":
        return a.price - b.price;
      case "stock":
        return b.stock - a.stock;
      case "createdAt":
        return (
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
      default:
        return 0;
    }
  });

  const categories = [
    "all",
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  const paginatedProducts = sortedProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
        marginTop: 3,
      }}
    >
      <AdminAppBar
        title="Products Management"
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

        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
              <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                <Store />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  Products Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage customer products
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/admin/products/create")}
              sx={{ borderRadius: 2 }}
            >
              Add Product
            </Button>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Category"
                  onChange={(e: SelectChangeEvent) =>
                    setFilterCategory(e.target.value)
                  }
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e: SelectChangeEvent) => setSortBy(e.target.value)}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="stock">Stock</MenuItem>
                  <MenuItem value="createdAt">Date Added</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.light" }}>
                      <ShoppingBag />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {products.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Products
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "success.light" }}>
                      <Inventory />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {products.filter((p) => p.stock > 0).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        In Stock
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "warning.light" }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        $
                        {products
                          .reduce((sum, p) => sum + p.price * p.stock, 0)
                          .toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Value
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "error.light" }}>
                      <Store />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {products.filter((p) => p.stock === 0).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Out of Stock
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table sx={{ "& .MuiTableCell-root": { py: 2 } }}>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: "grey.50",
                      "& .MuiTableCell-head": {
                        fontWeight: 600,
                        color: "text.primary",
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      },
                    }}
                  >
                    <TableCell sx={{ pl: 3 }}>Product</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell sx={{ pr: 3 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <CircularProgress size={48} />
                          <Typography
                            variant="h6"
                            color="text.secondary"
                            fontWeight={600}
                          >
                            Loading Products...
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Please wait while we fetch your products
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : paginatedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 64,
                              height: 64,
                              bgcolor: "grey.200",
                              mb: 1,
                            }}
                          >
                            <Inventory
                              sx={{ fontSize: 32, color: "text.secondary" }}
                            />
                          </Avatar>
                          <Typography
                            variant="h6"
                            color="text.secondary"
                            fontWeight={600}
                          >
                            No Products Found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm || filterCategory !== "all"
                              ? "Try adjusting your search or filters"
                              : "Get started by creating your first product"}
                          </Typography>
                          {!searchTerm && filterCategory === "all" && (
                            <Button
                              variant="contained"
                              startIcon={<Add />}
                              onClick={() => navigate("/admin/products/create")}
                              sx={{ mt: 2, borderRadius: 2 }}
                            >
                              Add Product
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProducts.map((product) => (
                      <TableRow
                        key={product._id}
                        hover
                        sx={{
                          "&:hover": { bgcolor: "action.hover" },
                          "& .MuiTableCell-body": {
                            borderColor: "divider",
                            fontSize: "0.875rem",
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        <TableCell sx={{ pl: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2.5,
                            }}
                          >
                            {product.image ? (
                              <CardMedia
                                component="img"
                                image={product.image}
                                alt={product.name}
                                sx={{
                                  width: 56,
                                  height: 56,
                                  borderRadius: 2,
                                  objectFit: "cover",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                  border: "1px solid rgba(0,0,0,0.05)",
                                }}
                              />
                            ) : (
                              <Avatar
                                sx={{
                                  width: 56,
                                  height: 56,
                                  bgcolor: "primary.light",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                              >
                                <ShoppingBag />
                              </Avatar>
                            )}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: "text.primary",
                                  fontSize: "0.9rem",
                                  mb: 0.5,
                                }}
                              >
                                {product.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "block",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 200,
                                }}
                              >
                                {product.description?.substring(0, 60)}...
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.category || "Uncategorized"}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              borderColor: "primary.main",
                              color: "primary.main",
                              bgcolor: "primary.50",
                            }}
                          />
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 600, color: "success.main" }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "1rem" }}
                            >
                              ${product.price?.toFixed(2)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color:
                                  product.stock > 10
                                    ? "text.primary"
                                    : "warning.main",
                              }}
                            >
                              {product.stock}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              product.stock > 0 ? "In Stock" : "Out of Stock"
                            }
                            size="small"
                            color={product.stock > 0 ? "success" : "error"}
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              ...(product.stock === 0 && {
                                bgcolor: "error.main",
                                color: "white",
                              }),
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.8rem" }}
                          >
                            {new Date(product.createdAt!).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ pr: 3 }}>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Edit Product" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleEditProduct(product)}
                                sx={{
                                  bgcolor: "primary.50",
                                  color: "primary.main",
                                  "&:hover": {
                                    bgcolor: "primary.main",
                                    color: "white",
                                    transform: "scale(1.05)",
                                  },
                                  transition: "all 0.2s ease-in-out",
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title={
                                product.activeOrdersCount &&
                                product.activeOrdersCount > 0
                                  ? `Cannot delete - Product has ${product.activeOrdersCount} active order(s). Use soft delete instead.`
                                  : "Delete Product"
                              }
                              arrow
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteClick(product)}
                                  disabled={
                                    deleteLoading[product._id] ||
                                    (product.activeOrdersCount !== undefined &&
                                      product.activeOrdersCount > 0)
                                  }
                                  sx={{
                                    bgcolor:
                                      product.activeOrdersCount !== undefined &&
                                      product.activeOrdersCount > 0
                                        ? "grey.100"
                                        : "error.50",
                                    color:
                                      product.activeOrdersCount !== undefined &&
                                      product.activeOrdersCount > 0
                                        ? "grey.400"
                                        : "error.main",
                                    "&:hover": {
                                      bgcolor:
                                        product.activeOrdersCount !==
                                          undefined &&
                                        product.activeOrdersCount > 0
                                          ? "grey.100"
                                          : "error.main",
                                      color:
                                        product.activeOrdersCount !==
                                          undefined &&
                                        product.activeOrdersCount > 0
                                          ? "grey.400"
                                          : "white",
                                      transform:
                                        product.activeOrdersCount !==
                                          undefined &&
                                        product.activeOrdersCount > 0
                                          ? "none"
                                          : "scale(1.05)",
                                    },
                                    "&.Mui-disabled": {
                                      bgcolor: "grey.100",
                                      color: "grey.400",
                                    },
                                    transition: "all 0.2s ease-in-out",
                                  }}
                                >
                                  {deleteLoading[product._id] ? (
                                    <CircularProgress size={16} thickness={4} />
                                  ) : (
                                    <Delete fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredProducts.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </Paper>
        </Box>
      </Box>

      <ConfirmDeleteProductModal
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        product={selectedProduct}
        loading={deleteLoading[selectedProduct?._id || ""]}
      />

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

export default AdminProductsList;
