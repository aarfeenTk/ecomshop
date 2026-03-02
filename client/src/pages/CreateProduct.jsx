import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  useTheme,
  InputAdornment,
  Card,
  CardMedia,
  IconButton,
  Divider,
  Chip,
  Breadcrumbs,
  Link,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Upload,
  Image as ImageIcon,
  Delete,
  Add,
  Store,
  AttachFile
} from '@mui/icons-material';
import { createProduct, updateProduct } from '../redux/slices/productSlice';
import { getProducts } from '../redux/slices/productSlice';

const CreateProduct = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, loading } = useSelector(state => state.products);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: null,
    imagePreview: ''
  });

  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  useEffect(() => {
    if (id && products.length > 0) {
      const product = products.find(p => p._id === id);
      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          stock: product.stock?.toString() || '',
          category: product.category || '',
          image: null,
          imagePreview: product.image || ''
        });
        setIsEditing(true);
      }
    }
  }, [id, products]);

  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Toys',
    'Food',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Please select an image file'
        }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'Image size should be less than 5MB'
        }));
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: e.target.result
        }));
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }
    
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.stock || isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      let imageUrl = formData.imagePreview;
      
      // If we have a file, convert it to base64
      if (formData.image && formData.image instanceof File) {
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(formData.image);
        });
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        image: imageUrl
      };

      let result;
      if (isEditing) {
        result = await dispatch(updateProduct({ id, productData }));
      } else {
        result = await dispatch(createProduct(productData));
      }

      if (result.error) {
        setErrors({ submit: result.error.message || 'Failed to save product' });
      } else {
        navigate('/admin/products');
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/admin/products">
          Admin
        </Link>
        <Link color="inherit" href="/admin/products">
          Products
        </Link>
        <Typography color="text.primary">
          {isEditing ? 'Edit Product' : 'Create New Product'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
          <Store />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {isEditing ? 'Edit Product' : 'Create New Product'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEditing ? 'Update product information' : 'Add a new product to your inventory'}
          </Typography>
        </Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/products')}
          sx={{ textTransform: 'none' }}
        >
          Back to Products
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column - Image Upload */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Product Image
              </Typography>
              
              {/* Image Upload Area */}
              <Box
                sx={{
                  border: `2px dashed ${theme.palette.divider}`,
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50'
                  }
                }}
                onClick={handleUploadClick}
              >
                {formData.imagePreview ? (
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={formData.imagePreview}
                      alt="Product preview"
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 2
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'error.main', color: 'white' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ py: 4 }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.light', mx: 'auto', mb: 2 }}>
                      <Upload sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Upload Product Image
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Click to browse or drag and drop
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PNG, JPG, GIF up to 5MB
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              {errors.image && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.image}
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Product Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Product Information
              </Typography>

              {errors.submit && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {errors.submit}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Product Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Store />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      error={!!errors.description}
                      helperText={errors.description}
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Describe your product..."
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      error={!!errors.price}
                      helperText={errors.price}
                      type="number"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            $
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Stock Quantity"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      error={!!errors.stock}
                      helperText={errors.stock}
                      type="number"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Add />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        label="Category"
                        sx={{ borderRadius: 2 }}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/admin/products')}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      minWidth: 120
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      isEditing ? 'Update Product' : 'Create Product'
                    )}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CreateProduct;
