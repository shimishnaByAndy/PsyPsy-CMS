import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Slider from "@mui/material/Slider";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FilterListIcon from "@mui/icons-material/FilterList";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function GridTableFilter({ onFilter, showFilters = true }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  
  // Filter states
  const [genderFilter, setGenderFilter] = useState('');
  const [ageRangeFilter, setAgeRangeFilter] = useState([0, 100]);
  const [lastSeenFilter, setLastSeenFilter] = useState('');
  
  // Define age range marks for the slider
  const ageMarks = [
    { value: 0, label: '0' },
    { value: 18, label: '18' },
    { value: 30, label: '30' },
    { value: 50, label: '50' },
    { value: 70, label: '70' },
    { value: 100, label: '100+' },
  ];
  
  // Last seen options
  const lastSeenOptions = [
    { value: 'today', label: t('tables.timeIndicators.hoursAgo', { count: 24 }) },
    { value: 'week', label: t('tables.timeIndicators.daysAgo', { count: 7 }) },
    { value: 'month', label: t('tables.timeIndicators.daysAgo', { count: 30 }) },
    { value: 'quarter', label: t('tables.timeIndicators.monthsAgo', { count: 3 }) },
    { value: 'inactive', label: t('tables.timeIndicators.inactive') },
  ];
  
  // Clear all filters
  const handleClearFilters = () => {
    setGenderFilter('');
    setAgeRangeFilter([0, 100]);
    setLastSeenFilter('');
    
    // Call onFilter with empty filters
    if (onFilter) {
      onFilter({});
    }
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    if (onFilter) {
      const filters = {};
      
      if (genderFilter) {
        filters.gender = genderFilter;
      }
      
      if (ageRangeFilter[0] > 0 || ageRangeFilter[1] < 100) {
        filters.ageRange = ageRangeFilter;
      }
      
      if (lastSeenFilter) {
        filters.lastSeen = lastSeenFilter;
      }
      
      onFilter(filters);
    }
  };
  
  // Toggle filter panel expansion
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Only render if filters are enabled
  if (!showFilters) return null;
  
  return (
    <Card sx={{ mb: 3 }}>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDBox display="flex" alignItems="center">
            <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <MDTypography variant="h6" fontWeight="medium">
              {t('tables.filters.title')}
            </MDTypography>
          </MDBox>
          
          <IconButton 
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-label="show more"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </MDBox>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Gender Filter */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="gender-filter-label">{t('tables.filters.gender')}</InputLabel>
                <Select
                  labelId="gender-filter-label"
                  value={genderFilter}
                  label={t('tables.filters.gender')}
                  onChange={(e) => setGenderFilter(e.target.value)}
                >
                  <MenuItem value="">{t('common.clear')}</MenuItem>
                  <MenuItem value="1">{t('statistics.distributions.gender.woman')}</MenuItem>
                  <MenuItem value="2">{t('statistics.distributions.gender.man')}</MenuItem>
                  <MenuItem value="3">{t('statistics.distributions.gender.other')}</MenuItem>
                  <MenuItem value="4">{t('statistics.distributions.gender.notDisclosed')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Age Range Filter */}
            <Grid item xs={12} md={4}>
              <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                {t('tables.filters.age')}
              </MDTypography>
              <Slider
                value={ageRangeFilter}
                onChange={(e, newValue) => setAgeRangeFilter(newValue)}
                valueLabelDisplay="auto"
                marks={ageMarks}
                min={0}
                max={100}
              />
            </Grid>
            
            {/* Last Seen Filter */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="last-seen-filter-label">{t('tables.filters.lastSeen')}</InputLabel>
                <Select
                  labelId="last-seen-filter-label"
                  value={lastSeenFilter}
                  label={t('tables.filters.lastSeen')}
                  onChange={(e) => setLastSeenFilter(e.target.value)}
                >
                  <MenuItem value="">{t('common.clear')}</MenuItem>
                  {lastSeenOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {/* Active Filters & Buttons */}
          <MDBox display="flex" justifyContent="space-between" mt={3}>
            <MDBox>
              {genderFilter && (
                <Chip 
                  label={`${t('tables.filters.gender')}: ${t(`statistics.distributions.gender.${
                    genderFilter === '1' ? 'woman' : 
                    genderFilter === '2' ? 'man' : 
                    genderFilter === '3' ? 'other' : 'notDisclosed'
                  }`)}`} 
                  onDelete={() => setGenderFilter('')}
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
              
              {(ageRangeFilter[0] > 0 || ageRangeFilter[1] < 100) && (
                <Chip 
                  label={`${t('tables.filters.age')}: ${ageRangeFilter[0]}-${ageRangeFilter[1]}`}
                  onDelete={() => setAgeRangeFilter([0, 100])}
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
              
              {lastSeenFilter && (
                <Chip 
                  label={`${t('tables.filters.lastSeen')}: ${
                    lastSeenOptions.find(opt => opt.value === lastSeenFilter)?.label
                  }`}
                  onDelete={() => setLastSeenFilter('')}
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
            </MDBox>
            
            <MDBox>
              <MDButton 
                variant="outlined" 
                color="secondary" 
                onClick={handleClearFilters}
                sx={{ mr: 2 }}
              >
                {t('common.clear')}
              </MDButton>
              
              <MDButton 
                variant="gradient" 
                color="info" 
                onClick={handleApplyFilters}
              >
                {t('common.apply')}
              </MDButton>
            </MDBox>
          </MDBox>
        </Collapse>
      </MDBox>
    </Card>
  );
}

export default GridTableFilter; 