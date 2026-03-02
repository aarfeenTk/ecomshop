import { Typography, Grid, Card, CardContent, CardMedia, Button, Box, Container, Skeleton } from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../redux/slices/productSlice';
import { Link } from 'react-router-dom';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const products = useSelector(state => state.products?.products || []);
  const loading = useSelector(state => state.products?.loading || false);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  useEffect(() => {
    const isAdminUser = user?.isAdmin === true || user?.role === 'admin';
    if (isAdminUser) {
      navigate('/admin/products', { replace: true });
    }
  }, [user, navigate]);

  const isAdminUser = user?.isAdmin === true || user?.role === 'admin';
  if (isAdminUser) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Loading Products...</Typography>
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card elevation={2}>
                <Skeleton variant="rectangular" height={140} />
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="rectangular" height={36} width={100} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <div>
      <Box sx={{ textAlign: 'center', py: 8, background: 'linear-gradient(45deg, #3f51b5 30%, #f50057 90%)', color: 'white' }}>
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom>
            Welcome to Our E-Commerce Store
          </Typography>
          <Typography variant="h5" gutterBottom>
            Discover amazing products at great prices
          </Typography>
          <Button variant="contained" color="secondary" size="large" component={Link} to="/products" sx={{ mt: 2 }}>
            Shop Now
          </Button>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Featured Products</Typography>
        <Grid container spacing={3}>
          {products.slice(0, 6).map(product => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card elevation={2} sx={{ '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.3s', boxShadow: 6 } }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={product.image}
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${product.price}
                  </Typography>
                  <Button component={Link} to={`/products/${product._id}`} variant="contained" sx={{ mt: 1 }}>
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default Home;
