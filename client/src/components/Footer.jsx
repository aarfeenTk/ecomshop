import { Box, Container, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer"
      sx={{ 
        py: 3, 
        backgroundColor: 'primary.main', 
        color: 'white', 
        textAlign: 'center',
        mt: 'auto',
        width: '100%'
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1">
          © 2023 E-Commerce Store. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
