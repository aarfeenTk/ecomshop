import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Alert,
  Paper,
  CardMedia,
  CircularProgress
} from '@mui/material';
import {
  Delete,
  ShoppingBag
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ConfirmDeleteProductModal = ({
  open,
  onClose,
  onConfirm,
  product,
  loading = false
}) => {
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          border: `1px solid ${theme.palette.divider}`
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: 'error.50'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: 'error.main',
            width: 48,
            height: 48
          }}>
            <Delete />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.dark' }}>
              Confirm Delete
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontSize: '0.95rem'
              }
            }}
          >
            You are about to permanently delete this product. All associated data will be lost.
          </Alert>
          
          {product && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'grey.50'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                {product.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {product.image ? (
                  <CardMedia
                    component="img"
                    image={product.image}
                    alt={product.name}
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: 2, 
                      objectFit: 'cover',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}
                  />
                ) : (
                  <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.light' }}>
                    <ShoppingBag />
                  </Avatar>
                )}
                
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Category: <strong>{product.category || 'Uncategorized'}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Price: <strong>${product.price?.toFixed(2)}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stock: <strong>{product.stock} units</strong>
                  </Typography>
                </Box>
              </Box>
              
              {product.description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    mt: 2,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    fontStyle: 'italic'
                  }}
                >
                  "{product.description.substring(0, 150)}{product.description.length > 150 ? '...' : ''}"
                </Typography>
              )}
            </Paper>
          )}
          
          <Typography variant="body2" color="error.main" sx={{ mt: 3, fontWeight: 500 }}>
            ⚠️ This action is irreversible. Please confirm you want to proceed.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        p: 3, 
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: 'grey.50',
        gap: 2
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{ 
            borderRadius: 2,
            px: 3,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          color="error"
          startIcon={<Delete />}
          disabled={loading}
          sx={{ 
            borderRadius: 2,
            px: 3,
            textTransform: 'none',
            fontWeight: 600,
            minWidth: 120
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'Delete Product'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteProductModal;
