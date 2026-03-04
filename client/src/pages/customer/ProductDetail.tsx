import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useProduct } from "../../hooks/useProducts";
import { useAddToCart } from "../../hooks/useCart";
import { toast } from "react-toastify";
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
import { Product, AddToCartData } from "../../types";
import { RootState } from "../../redux/store";

const ProductDetail: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<number>(0);

  const { data: productData, isLoading: loading } = useProduct(id || null);
  const product: Product | null = productData?.data || null;
  const addToCartMutation = useAddToCart();

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      if (!user) {
        // User not authenticated, redirect to login
        navigate("/login");
        return;
      }

      // Show toast immediately for better UX
      toast.success(`${product.name} added to cart!`, {
        position: "top-right",
        autoClose: 1500,
      });

      // Pass full product details for optimistic update
      const addToCartData: AddToCartData = {
        productId: product._id,
        quantity,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          active: product.active,
          isDeleted: product.isDeleted,
        },
      };

      addToCartMutation.mutate(addToCartData, {
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to add to cart",
            {
              position: "top-right",
              autoClose: 3000,
            },
          );
        },
        onSettled: () => {
          // Redirect to cart after mutation settles (success or error)
          setTimeout(() => {
            navigate("/cart");
          }, 500);
        },
      });
    }
  };

  const handleQuantityChange = (change: number) => {
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

  const totalPrice = product.price * quantity;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/products")}
        sx={{ mb: 3, textTransform: "none" }}
      >
        Back to Products
      </Button>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={1}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <CardMedia
              component="img"
              image={
                product.image ||
                "https://via.placeholder.com/600x600?text=Product"
              }
              alt={product.name}
              sx={{
                height: 500,
                width: "100%",
                objectFit: "cover",
              }}
            />
            {product.stock === 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  bgcolor: "error.main",
                  color: "white",
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  fontWeight: 600,
                }}
              >
                Out of Stock
              </Box>
            )}
          </Paper>

          {/* Thumbnail Images */}
          <Box sx={{ display: "flex", gap: 1, mt: 2, overflowX: "auto" }}>
            {[product.image].map((img, index) => (
              <Paper
                key={index}
                elevation={selectedImage === index ? 3 : 1}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  cursor: "pointer",
                  border:
                    selectedImage === index
                      ? `2px solid ${theme.palette.primary.main}`
                      : "none",
                  overflow: "hidden",
                }}
                onClick={() => setSelectedImage(index)}
              >
                <CardMedia
                  component="img"
                  image={
                    img || "https://via.placeholder.com/80x80?text=Product"
                  }
                  alt={`${product.name} ${index + 1}`}
                  sx={{
                    height: "100%",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
              </Paper>
            ))}
          </Box>
        </Grid>

        {/* Product Information */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                lineHeight: 1.2,
              }}
            >
              {product.name}
            </Typography>

            <Typography
              variant="h4"
              color="primary.main"
              sx={{
                fontWeight: 700,
                mb: 2,
              }}
            >
              ${product.price}
            </Typography>

            {/* Stock Status */}
            <Box sx={{ mb: 3 }}>
              {product.stock > 0 ? (
                <Chip
                  icon={<Security />}
                  label={`${product.stock} units available`}
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              ) : (
                <Chip
                  label="Out of Stock"
                  color="error"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Description
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                {product.description ||
                  "No description available for this product."}
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Quantity Selector */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quantity
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Remove />
                </IconButton>
                <Typography
                  variant="h6"
                  sx={{
                    minWidth: 60,
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  {quantity}
                </Typography>
                <IconButton
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Add />
                </IconButton>
              </Box>
            </Box>

            {/* Total Price */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="text.secondary">
                Total Price:{" "}
                <Typography
                  component="span"
                  variant="h5"
                  color="primary.main"
                  sx={{ fontWeight: 700 }}
                >
                  ${totalPrice.toFixed(2)}
                </Typography>
              </Typography>
            </Box>

            {/* Add to Cart Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              sx={{
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                mb: 3,
              }}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>

            {/* Features */}
            <Box sx={{ mt: "auto" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LocalShipping sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  Free shipping on orders over $50
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Refresh sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  30-day return policy
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;
