import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Container,
  CircularProgress,
} from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Product } from "../../types";
import { RootState } from "../../redux/store";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useProducts();
  const { user } = useSelector((state: RootState) => state.auth);
  const products: Product[] = data?.data || [];

  useEffect(() => {
    const isAdminUser = user?.isAdmin === true || user?.role === "admin";
    if (isAdminUser) {
      navigate("/admin/products", { replace: true });
    }
  }, [user, navigate]);

  const isAdminUser = user?.isAdmin === true || user?.role === "admin";
  if (isAdminUser) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome to Our Store
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Discover amazing products at great prices
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/products"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Shop Now
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Featured Products
      </Typography>

      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            py: 8,
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            Loading Products...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we fetch the latest products
          </Typography>
        </Box>
      ) : products.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later for new products
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.slice(0, 6).map((product: Product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card elevation={2} sx={{ "&:hover": { boxShadow: 4 } }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    product.image ||
                    "https://via.placeholder.com/300x200?text=Product"
                  }
                  alt={product.name}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {product.description}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="primary.main"
                    sx={{ fontWeight: 700, mb: 2 }}
                  >
                    ${product.price}
                  </Typography>
                  <Button
                    component={Link}
                    to={`/products/${product._id}`}
                    variant="contained"
                    fullWidth
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Home;
