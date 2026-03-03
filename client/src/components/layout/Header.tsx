import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  ShoppingCart,
  Menu as MenuIcon,
  AccountCircle,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import { clearCart } from "../../redux/slices/cartSlice";
import { useState } from "react";
import type { RootState } from "../../redux/store";

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(
    null,
  );

  const isMenuOpen = Boolean(anchorEl);
  const isUserMenuOpen = Boolean(userMenuAnchorEl);

  const { user } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    dispatch(clearCart());
    dispatch(logout());
    navigate("/login");
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = (): void => {
    setAnchorEl(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = (): void => {
    setUserMenuAnchorEl(null);
  };

  const handleNavigation = (path: string): void => {
    navigate(path);
    handleMobileMenuClose();
  };

  const isActiveRoute = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: "background.paper",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        borderBottom: "1px solid rgba(0,0,0,0.12)",
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
          <ShoppingCart
            sx={{
              color: "primary.main",
              fontSize: 28,
              mr: 1,
            }}
          />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "text.primary",
              fontWeight: 700,
              fontSize: isMobile ? "1.1rem" : "1.25rem",
              "&:hover": { color: "primary.dark" },
            }}
          >
            E-Shop
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 1,
            ml: "auto",
          }}
        >
          <Button
            color="primary"
            component={Link}
            to="/products"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              px: 2,
              py: 1,
              borderRadius: 2,
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: isActiveRoute("/products") ? "100%" : "0%",
                height: "2px",
                bgcolor: "primary.main",
                transition: "width 0.3s ease",
              },
              "&:hover": {
                bgcolor: "rgba(63, 81, 181, 0.08)",
                "&::after": {
                  width: "100%",
                },
              },
            }}
          >
            Products
          </Button>

          {user ? (
            <>
              <Button
                color="primary"
                component={Link}
                to="/orders"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: isActiveRoute("/orders") ? "100%" : "0%",
                    height: "2px",
                    bgcolor: "primary.main",
                    transition: "width 0.3s ease",
                  },
                  "&:hover": {
                    bgcolor: "rgba(63, 81, 181, 0.08)",
                    "&::after": {
                      width: "100%",
                    },
                  },
                }}
              >
                My Orders
              </Button>

              {user.role === "admin" && (
                <Button
                  color="primary"
                  component={Link}
                  to="/admin/products"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: "rgba(63, 81, 181, 0.08)",
                    },
                  }}
                >
                  Admin
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                color="primary"
                component={Link}
                to="/login"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: "rgba(63, 81, 181, 0.08)",
                  },
                }}
              >
                Login
              </Button>

              <Button
                variant="outlined"
                color="primary"
                component={Link}
                to="/register"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: "rgba(63, 81, 181, 0.08)",
                  },
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>

        {/* Cart */}
        {user && (
          <IconButton
            color="primary"
            component={Link}
            to="/cart"
            sx={{
              ml: 2,
              "&:hover": { color: "primary.dark" },
            }}
          >
            <Badge badgeContent={items.length} color="secondary">
              <ShoppingCart />
            </Badge>
          </IconButton>
        )}

        {/* User Menu */}
        {user && (
          <>
            <IconButton
              size="large"
              edge="end"
              color="primary"
              onClick={handleUserMenuOpen}
              sx={{
                ml: 1,
                "&:hover": {
                  bgcolor: "rgba(63, 81, 181, 0.08)",
                },
              }}
            >
              <AccountCircle />
            </IconButton>

            <Menu
              anchorEl={userMenuAnchorEl}
              open={isUserMenuOpen}
              onClose={handleUserMenuClose}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
