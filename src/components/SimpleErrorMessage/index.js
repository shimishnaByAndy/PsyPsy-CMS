import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function SimpleErrorMessage({ message }) {
  if (!message) return null;
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '12px 16px',
        marginBottom: '16px',
        backgroundColor: 'rgba(232, 51, 51, 0.08)',
        border: '1px solid rgba(232, 51, 51, 0.5)',
        borderRadius: '8px',
      }}
    >
      <ErrorOutlineIcon 
        sx={{ 
          color: '#e33333', 
          marginRight: '12px',
          fontSize: '20px'
        }} 
      />
      <Typography
        variant="body2"
        component="span"
        sx={{
          color: '#000',
          fontWeight: 400,
          fontSize: '14px',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}

SimpleErrorMessage.propTypes = {
  message: PropTypes.string,
};

export default SimpleErrorMessage; 