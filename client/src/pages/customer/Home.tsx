import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Container,
} from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../redux/slices/productSlice";
import { Link } from "react-router-dom";
import type { RootState, AppDispatch } from "../../redux/store";

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const products = useSelector(
    (state: RootState) => state.products?.products || [],
  );
  const loading = useSelector(
    (state: RootState) => state.products?.loading || false,
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getProducts({}));
  }, [dispatch]);

  useEffect(() => {
    const isAdminUser = user?.role === "admin";
    if (isAdminUser) {
      navigate("/admin/products", { replace: true });
    }
  }, [user, navigate]);

  const isAdminUser = user?.role === "admin";
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

      <Grid container spacing={3}>
        {products.slice(0, 6).map((product) => (
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
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
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
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to={`/products/${product._id}`}
                  sx={{ borderRadius: 2 }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Loading more products...
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Home;
