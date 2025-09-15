import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Divider,
  Paper,
} from '@mui/material';
import { useTheme } from '../context/ThemeContext';
import {
  THEME_LAYOUT_OPTIONS,
  THEME_MODE_OPTIONS,
  THEME_SKIN_OPTIONS,
} from '../context/constants';

const ThemeSelector = () => {
  const { mode, skin, layout, setThemeMode, setThemeSkin, setThemeLayout } = useTheme();

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Theme Settings
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Theme Mode Selection */}
      <Box mb={3}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Theme Mode</FormLabel>
          <RadioGroup
            value={mode}
            onChange={(e) => setThemeMode(e.target.value)}
            row
          >
            {THEME_MODE_OPTIONS.map((option) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio />}
                label={option.charAt(0).toUpperCase() + option.slice(1)}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Theme Skin Selection */}
      <Box mb={3}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Theme Skin</FormLabel>
          <RadioGroup
            value={skin}
            onChange={(e) => setThemeSkin(e.target.value)}
            row
          >
            {THEME_SKIN_OPTIONS.map((option) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio />}
                label={option.charAt(0).toUpperCase() + option.slice(1)}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Layout Selection */}
      <Box>
        <FormControl component="fieldset">
          <FormLabel component="legend">Layout</FormLabel>
          <RadioGroup
            value={layout}
            onChange={(e) => setThemeLayout(e.target.value)}
            row
          >
            {THEME_LAYOUT_OPTIONS.map((option) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio />}
                label={option.charAt(0).toUpperCase() + option.slice(1)}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default ThemeSelector; 