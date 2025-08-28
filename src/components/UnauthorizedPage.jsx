import React from 'react';
import { Typography, Button, Box } from '@mui/material';
import { LockOutlined, Home } from '@mui/icons-material';
import { Link } from 'react-router-dom';

/**
 * ===========================================
 * Component: UnauthorizedPage
 * Created: 2025-05-07
 * 
 * Description:
 * - A page that displays when a user attempts to access a route they don't have permission for
 * 
 * Purpose:
 * - To provide a clear message to users when they try to access unauthorized content
 * - To offer a way back to their authorized dashboard
 * 
 * Props:
 * - None
 * 
 * State Variables:
 * - None
 * 
 * Functions:
 * - getHomeRoute: Determines the proper home route based on the user's role
 * 
 * Notes:
 * - Styling matches the application's color scheme with the primary blue (#1E3A8A)
 * ===========================================
 */
export default function UnauthorizedPage() {
  const staffData = JSON.parse(localStorage.getItem("staff") || "{}");
  
  // Always redirect to Home for now - can be customized if different roles need different home pages
  const getHomeRoute = () => {
    return "/Home";
  };
  
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      bgcolor: '#f8fafc',
      p: 3
    }}>
      <Box sx={{
        bgcolor: 'white',
        borderRadius: 4,
        p: 5,
        maxWidth: 500,
        textAlign: 'center',
        boxShadow: 3
      }}>
        <LockOutlined sx={{ fontSize: 70, color: '#1E3A8A', mb: 2 }} />
        
        <Typography variant="h4" fontWeight="bold" color="#1E3A8A" gutterBottom>
          Access Restricted
        </Typography>
        
        <Typography variant="body1" paragraph>
          You don't have permission to access this page. This area is restricted based on your staff role.
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Current Role: <strong>{staffData.position || "Unknown"}</strong>
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          If you believe you should have access to this page, please contact the system administrator.
        </Typography>
        
        <Button
          component={Link}
          to={getHomeRoute()}
          variant="contained"
          startIcon={<Home />}
          sx={{
            bgcolor: '#1E3A8A',
            borderRadius: 28,
            px: 3,
            py: 1,
            mt: 2,
            '&:hover': {
              bgcolor: '#152c70'
            }
          }}
        >
          Return to Dashboard
        </Button>
      </Box>
    </Box>
  );
};
