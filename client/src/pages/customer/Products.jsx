import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useProducts } from '../../hooks/useProducts';
import { useAddToCart } from '../../hooks/useCart';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Skeleton,
  useTheme,
  Pagination,
  CircularProgress
} from '@mui/material';
import { ShoppingCart, Search } from '@mui/icons-material';

const Products = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: productsData, isLoading: loading } = useProducts(currentPage, itemsPerPage);
  const products = productsData?.data || [];
  const pagination = productsData?.pagination || { page: 1, pages: 1, total: 0 };
  const addToCartMutation = useAddToCart();

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category && category.length > 0) {
      filtered = filtered.filter(product => category.includes(product.category));
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, category]);

  const categories = [...new Set(products.map(product => product.category))];

  const handleAddToCart = (product, e) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation(); // Prevent event bubbling

    if (!user) {
      // User not authenticated, redirect to login
      navigate('/login');
      return;
    }

    // Show toast immediately for better UX
    toast.success(`${product.name} added to cart!`, {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    addToCartMutation.mutate({ productId: product._id, quantity: 1 }, {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add to cart', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    });
    
    // Redirect to cart after a short delay
    setTimeout(() => {
      navigate('/cart');
    }, 1000);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
          Discover Products
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Find exactly what you're looking for
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            Loading Products...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we fetch the latest products
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Discover Products
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Find exactly what you're looking for
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="medium"
          sx={{ 
            maxWidth: { xs: '100%', md: 400 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
        
        <FormControl size="medium" sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            multiple
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            label="Category"
            sx={{ borderRadius: 2 }}
            renderValue={(selected) => selected.length === 0 ? 'Select categories' : selected.join(', ')}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {category && category.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {category.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                onDelete={() => setCategory(category.filter(c => c !== cat))}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
            <Chip
              label="Clear All"
              onDelete={() => setCategory([])}
              color="default"
              variant="outlined"
              size="small"
            />
          </Box>
        )}
      </Box>

      {filteredProducts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <Card
                  component={Link}
                  to={`/products/${product._id}`}
                  elevation={1}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image || 'https://via.placeholder.com/300x200?text=Product'}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      height: 48,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      height: 40,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {product.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography
                      variant="h6"
                      color="primary.main"
                      sx={{ fontWeight: 700 }}
                    >
                      ${product.price}
                    </Typography>
                    {product.stock > 0 ? (
                      <Chip
                        label={`${product.stock} in stock`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        label="Out of stock"
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <div onClick={(e) => e.preventDefault()} style={{ width: '100%' }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCart />}
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={product.stock === 0}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1,
                      }}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={(e, page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
          Showing {filteredProducts.length} of {pagination.total} products
        </Typography>
      </>
      )}
    </Container>
  );
};

export default Products;
