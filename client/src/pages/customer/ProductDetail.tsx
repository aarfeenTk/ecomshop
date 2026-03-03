import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../../redux/slices/productSlice";
import { addToCart } from "../../redux/slices/cartSlice";
import {
  Container,
  Grid,
  CardMedia,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  Paper,
  Divider,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  ShoppingCart,
  Add,
  Remove,
  ArrowBack,
  LocalShipping,
  Security,
  Refresh,
} from "@mui/icons-material";
import type { RootState, AppDispatch } from "../../redux/store";
import type { Product } from "../../types";

const ProductDetail: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading } = useSelector(
    (state: RootState) => state.products,
  );
  const [quantity, setQuantity] = useState(1);
  const product = products.find((p: Product) => p._id === id);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(getProducts({}));
    }
  }, [dispatch, products.length]);

  const handleAddToCart = (): void => {
    if (product && product.stock > 0) {
      dispatch(addToCart({ productId: product._id, quantity }));
    }
  };

  const handleQuantityChange = (change: number): void => {
    const newQuantity = quantity + change;
    if (product && newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
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

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Product not found
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/products")}
            sx={{ mt: 2 }}
          >
            Back to Products
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/products")}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          p: 4,
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <CardMedia
              component="img"
              image={
                product.image ||
                "https://via.placeholder.com/500x500?text=Product"
              }
              alt={product.name}
              sx={{
                width: "100%",
                height: 400,
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              {product.name}
            </Typography>

            <Typography
              variant="h4"
              color="primary.main"
              sx={{ fontWeight: 700, mb: 3 }}
            >
              ${product.price}
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.7 }}
            >
              {product.description}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Chip
                label={product.category}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={
                  product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"
                }
                color={product.stock > 0 ? "success" : "error"}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {product.stock > 0 && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Typography variant="body1" fontWeight={600}>
                  Quantity:
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Remove />
                </IconButton>
                <Typography
                  variant="body1"
                  sx={{ minWidth: 30, textAlign: "center" }}
                >
                  {quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  <Add />
                </IconButton>
              </Box>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>

            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <LocalShipping color="action" />
                <Typography variant="body2" color="text.secondary">
                  Free shipping on orders over $50
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Security color="action" />
                <Typography variant="body2" color="text.secondary">
                  Secure payment
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Refresh color="action" />
                <Typography variant="body2" color="text.secondary">
                  Easy returns
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProductDetail;
