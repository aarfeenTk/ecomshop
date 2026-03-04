import { useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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
  Card,
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
  Store,
  Add,
} from "@mui/icons-material";
import {
  useCreateProduct,
  useUpdateProduct,
  useProducts,
} from "../../hooks/useProducts";
import AdminSidebar from "../../components/layout/AdminSidebar";
import AdminAppBar from "../../components/layout/AdminAppBar";
import {
  productSchema,
  ProductFormData,
} from "../../validations/productValidation";

const ProductForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: productsData } = useProducts(1, 1000);
  const products = productsData?.data || [];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [submitError, setSubmitError] = useState("");
  const drawerWidth = 280;

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: yupResolver(productSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      price: undefined as any,
      stock: undefined as any,
      category: "",
      image: "",
    },
  });

  const formData = watch();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    if (id && products.length > 0) {
      const product = products.find((p: any) => p._id === id);
      if (product) {
        setValue("name", product.name);
        setValue("description", product.description);
        setValue("price", product.price);
        setValue("stock", product.stock);
        setValue("category", product.category);
        setValue("image", product.image);
        setImagePreview(product.image);
        setIsEditing(true);
      }
    }
  }, [id, products, setValue]);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setValue("image", "", { shouldValidate: true });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setValue("image", "", { shouldValidate: true });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setValue("image", result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setValue("image", "", { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    setSubmitting(true);
    setSubmitError("");

    try {
      let imageUrl = data.image;

      if (data.image && data.image.startsWith("data:")) {
        imageUrl = data.image;
      }

      const productData = {
        name: data.name.trim(),
        description: data.description.trim(),
        price: parseFloat(data.price.toString()),
        stock: parseInt(data.stock.toString()),
        category: data.category,
        image: imageUrl,
      };

      if (isEditing && id) {
        await updateProductMutation.mutateAsync({ id, productData });
      } else {
        await createProductMutation.mutateAsync(productData);
      }

      navigate("/admin/products");
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || "Failed to save product");
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
                    {imagePreview ? (
                      <Box sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          image={imagePreview}
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
                      {errors.image.message}
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

                  {submitError && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {submitError}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Product Name"
                          {...register("name")}
                          error={!!errors.name}
                          helperText={errors.name?.message}
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
                          {...register("description")}
                          error={!!errors.description}
                          helperText={errors.description?.message}
                          multiline
                          rows={4}
                          variant="outlined"
                          placeholder="Provide a detailed description of your product..."
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="price"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Price"
                              error={!!errors.price}
                              helperText={errors.price?.message}
                              type="number"
                              variant="outlined"
                              placeholder="0.00"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    $
                                  </InputAdornment>
                                ),
                                inputProps: { min: 0, step: 0.01 },
                              }}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(
                                  value === "" ? undefined : parseFloat(value),
                                );
                              }}
                              value={field.value ?? ""}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="stock"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Stock Quantity"
                              error={!!errors.stock}
                              helperText={errors.stock?.message}
                              type="number"
                              variant="outlined"
                              placeholder="0"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Add />
                                  </InputAdornment>
                                ),
                                inputProps: { min: 0 },
                              }}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(
                                  value === "" ? undefined : parseInt(value),
                                );
                              }}
                              value={field.value ?? ""}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Controller
                          name="category"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth error={!!errors.category}>
                              <InputLabel>Category</InputLabel>
                              <Select
                                {...field}
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
                                  {errors.category.message}
                                </Typography>
                              )}
                            </FormControl>
                          )}
                        />
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

export default ProductForm;
