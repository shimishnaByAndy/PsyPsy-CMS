import { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tabs,
  Tab,
  Box,
  Divider,
  Chip
} from "@mui/material";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function UserDetail({ open, user, onClose }) {
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Format method for readability
  const formatValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object" && value instanceof Date) return value.toLocaleString();
    return value.toString();
  };
  
  // Render fields in a consistent format
  const renderField = (label, value) => (
    <MDBox mb={2}>
      <MDTypography variant="caption" color="text" fontWeight="bold" textTransform="uppercase">
        {label}
      </MDTypography>
      <MDTypography variant="body2">
        {formatValue(value)}
      </MDTypography>
    </MDBox>
  );
  
  // Get user type name
  const getUserTypeName = (userType) => {
    switch (userType) {
      case 0: return "Administrator";
      case 1: return "Professional";
      case 2: return "Client";
      default: return `Type ${userType}`;
    }
  };
  
  // Render status chip
  const renderStatusChip = (isBlocked) => (
    <Chip 
      label={isBlocked ? "Blocked" : "Active"} 
      color={isBlocked ? "error" : "success"} 
      size="small"
      sx={{ ml: 1 }}
    />
  );
  
  if (!user) return null;
  
  const userTypeName = getUserTypeName(user.userType);
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <MDBox>
            <MDTypography variant="h6">User Details</MDTypography>
            <MDTypography variant="body2" color="text">
              {userTypeName} - {user.username}
            </MDTypography>
          </MDBox>
          <MDButton 
            variant="text" 
            color="dark"
            onClick={onClose}
          >
            <Icon>close</Icon>
          </MDButton>
        </MDBox>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <MDBox mb={3}>
          <MDBox display="flex" alignItems="center" mb={2}>
            <MDAvatar 
              bgColor={user.isBlocked ? "error" : "success"}
              size="lg"
            >
              {userTypeName.charAt(0)}
            </MDAvatar>
            <MDBox ml={2}>
              <MDBox display="flex" alignItems="center">
                <MDTypography variant="h5">{user.username}</MDTypography>
                {renderStatusChip(user.isBlocked)}
              </MDBox>
              <MDTypography variant="body2" color="text">{user.email}</MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
        
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="Basic Info" />
          {user.userType === 1 && <Tab label="Professional Details" />}
          {user.userType === 2 && <Tab label="Client Details" />}
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              {renderField("User ID", user.id)}
              {renderField("Username", user.username)}
              {renderField("Email", user.email)}
              {renderField("Email Verified", user.emailVerified)}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderField("User Type", userTypeName)}
              {renderField("Created At", new Date(user.createdAt).toLocaleString())}
              {renderField("Updated At", new Date(user.updatedAt).toLocaleString())}
              {renderField("Status", user.isBlocked ? "Blocked" : "Active")}
              {user.roleNames && user.roleNames.length > 0 && renderField("Roles", user.roleNames)}
            </Grid>
          </Grid>
        </TabPanel>
        
        {user.userType === 1 && user.professional && (
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {renderField("First Name", user.professional.firstName)}
                {renderField("Last Name", user.professional.lastName)}
                {renderField("Professional Type", getProfTypeLabel(user.professional.profType))}
                {renderField("Business Name", user.professional.businessName)}
                {renderField("Business Email", user.professional.bussEmail)}
                {renderField("Business Phone", user.professional.bussPhoneNb)}
              </Grid>
              <Grid item xs={12} md={6}>
                {user.professional.meetType !== undefined && 
                  renderField("Meeting Type", getMeetTypeLabel(user.professional.meetType))}
                {user.professional.servOfferedArr && user.professional.servOfferedArr.length > 0 && 
                  renderField("Services Offered", user.professional.servOfferedArr.map(s => getServiceLabel(s)).join(", "))}
                {user.professional.offeredLangArr && user.professional.offeredLangArr.length > 0 && 
                  renderField("Languages", user.professional.offeredLangArr.map(l => getLanguageLabel(l)).join(", "))}
                {user.professional.expertises && user.professional.expertises.length > 0 && 
                  renderField("Expertises", user.professional.expertises.map(e => getExpertiseLabel(e)).join(", "))}
              </Grid>
            </Grid>
          </TabPanel>
        )}
        
        {user.userType === 2 && user.client && (
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {renderField("First Name", user.client.firstName)}
                {renderField("Last Name", user.client.lastName)}
                {user.client.gender !== undefined && renderField("Gender", getGenderLabel(user.client.gender))}
                {user.client.dob && renderField("Date of Birth", new Date(user.client.dob).toLocaleDateString())}
                {user.client.phoneNb && renderField("Phone Number", user.client.phoneNb)}
              </Grid>
              <Grid item xs={12} md={6}>
                {user.client.spokenLangArr && user.client.spokenLangArr.length > 0 && 
                  renderField("Languages", user.client.spokenLangArr.map(l => getLanguageLabel(l)).join(", "))}
                {user.client.searchRadius && renderField("Search Radius", `${user.client.searchRadius} km`)}
                {user.client.location && (
                  <>
                    {renderField("Latitude", user.client.location.latitude)}
                    {renderField("Longitude", user.client.location.longitude)}
                  </>
                )}
              </Grid>
              
              {user.client.address && (
                <Grid item xs={12}>
                  <MDTypography variant="h6" mb={2}>Address</MDTypography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      {renderField("Street", user.client.address.street)}
                      {renderField("City", user.client.address.city)}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {renderField("State/Province", user.client.address.state)}
                      {renderField("Postal Code", user.client.address.zip)}
                      {renderField("Country", user.client.address.country)}
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </TabPanel>
        )}
      </DialogContent>
      <DialogActions>
        <MDButton variant="text" onClick={onClose}>
          Close
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

UserDetail.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default UserDetail;

// Helper functions for labels
const getProfTypeLabel = (code) => {
  const types = {
    0: "Psychologist",
    1: "Social Worker",
    2: "Psychotherapist",
    3: "Counselor",
    // Add more mappings as needed
  };
  return types[code] || `Type ${code}`;
};

const getMeetTypeLabel = (code) => {
  const types = {
    0: "In-Person Only",
    1: "Online Only",
    2: "Both In-Person and Online",
    // Add more mappings as needed
  };
  return types[code] || `Meet Type ${code}`;
};

const getGenderLabel = (code) => {
  const genders = {
    0: "Male",
    1: "Female",
    2: "Non-Binary",
    // Add more mappings as needed
  };
  return genders[code] || `Gender ${code}`;
};

const getLanguageLabel = (code) => {
  const languages = {
    0: "English",
    1: "French",
    2: "Spanish",
    // Add more mappings as needed
  };
  return languages[code] || `Language ${code}`;
};

const getServiceLabel = (code) => {
  const services = {
    0: "Psychotherapy",
    1: "Counseling",
    2: "Assessment",
    // Add more mappings as needed
  };
  return services[code] || `Service ${code}`;
};

const getExpertiseLabel = (code) => {
  const expertises = {
    0: "Anxiety",
    1: "Depression",
    2: "Trauma",
    // Add more mappings as needed
  };
  return expertises[code] || `Expertise ${code}`;
}; 