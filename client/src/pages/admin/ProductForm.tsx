import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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
  CardMedia,
  IconButton,
  Divider,
  Toolbar,
  Avatar,
} from "@mui/material";
import {
  ArrowBack,
  Save,
  Upload,
  Delete,
  Add,
  Store,
} from "@mui/icons-material";
import {
  createProduct,
  updateProduct,
  getProducts,
} from "../../redux/slices/productSlice";
import AdminSidebar from "../../components/layout/AdminSidebar";
import AdminAppBar from "../../components/layout/AdminAppBar";
import type { RootState, AppDispatch } from "../../redux/store";
import type { Product } from "../../types";
import type { SelectChangeEvent } from "@mui/material/Select";

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  image: File | null;
  imagePreview: string;
}

const CreateProduct: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { products } = useSelector((state: RootState) => state.products);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProductFormState>({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: null,
    imagePreview: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerWidth = 280;

  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    dispatch(getProducts({}));
  }, [dispatch]);

  useEffect(() => {
    if (id && products.length > 0) {
      const product = products.find((p: Product) => p._id === id);
      if (product) {
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          stock: product.stock?.toString() || "",
          category: product.category || "",
          image: null,
          imagePreview: product.image || "",
        });
        setIsEditing(true);
      }
    }
  }, [id, products]);

  const categories = [
    "Electronics",
    "Clothing",
    "Books",
    "Home & Garden",
    "Sports",
    "Toys",
    "Food",
    "Other",
  ];

  const handleChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select an image file",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 5MB",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: result,
        }));
        setErrors((prev) => ({
          ...prev,
          image: "",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (): void => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = (): void => {
    fileInputRef.current?.click();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Product description is required";
    }

    if (
      !formData.price ||
      isNaN(Number(formData.price)) ||
      parseFloat(formData.price) <= 0
    ) {
      newErrors.price = "Valid price is required";
    }

    if (
      !formData.stock ||
      isNaN(Number(formData.stock)) ||
      parseInt(formData.stock) < 0
    ) {
      newErrors.stock = "Valid stock quantity is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.image && !formData.imagePreview) {
      newErrors.image = "Product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = formData.imagePreview;

      if (formData.image && formData.image instanceof File) {
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
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
        image: imageUrl,
      };

      let result;
      if (isEditing) {
        result = await dispatch(updateProduct({ id, productData })).unwrap();
      } else {
        result = await dispatch(createProduct(productData)).unwrap();
      }

      // Success - navigate to products list
      navigate("/admin/products");
    } catch (error) {
      setErrors({
        submit: (error as Error).message || "An unexpected error occurred",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AdminAppBar
        title={isEditing ? "Edit Product" : "Create Product"}
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
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/admin/products")}
              sx={{ textTransform: "none", mr: 2, minWidth: "auto" }}
            />
            <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
              <Store />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                {isEditing ? "Edit Product" : "Create New Product"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditing
                  ? "Update product information"
                  : "Add a new product to your inventory"}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={4}>
            {/* Left Column - Image Upload */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
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
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "primary.50",
                      },
                    }}
                    onClick={handleUploadClick}
                  >
                    {formData.imagePreview ? (
                      <Box sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          image={formData.imagePreview}
                          alt="Product preview"
                          sx={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                            borderRadius: 2,
                          }}
                        />
                        <IconButton
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "background.paper",
                            "&:hover": {
                              bgcolor: "error.main",
                              color: "white",
                            },
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
                        <Avatar
                          sx={{
                            width: 64,
                            height: 64,
                            bgcolor: "primary.light",
                            mx: "auto",
                            mb: 2,
                          }}
                        >
                          <Upload sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          Upload Product Image
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
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
                    style={{ display: "none" }}
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
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
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
                          placeholder="Enter product name (e.g., iPhone 15 Pro)"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Store />
                              </InputAdornment>
                            ),
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
                          InputProps={{
                            placeholder:
                              "Provide a detailed description of your product, including features, specifications, and benefits...",
                          }}
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
                          placeholder="0.00"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
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
                          placeholder="0"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Add />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl fullWidth error={!!errors.category}>
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
                          {errors.category && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ mt: 0.5, ml: 2 }}
                            >
                              {errors.category}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* Action Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => navigate("/admin/products")}
                        disabled={submitting}
                        sx={{ borderRadius: 2 }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        disabled={submitting}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          minWidth: 120,
                        }}
                      >
                        {submitting ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : isEditing ? (
                          "Update Product"
                        ) : (
                          "Create Product"
                        )}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default CreateProduct;
