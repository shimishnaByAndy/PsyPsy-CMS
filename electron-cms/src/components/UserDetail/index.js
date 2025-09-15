/**
 * Enhanced UserDetail Component for PsyPsy CMS
 * Professional and clean styling with comprehensive user information display
 * Supports User, Client, and Professional data structures
 */

import { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  Grid,
  Tabs,
  Tab,
  Box,
  Divider,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Badge
} from "@mui/material";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";

// PsyPsy Theme System
import { useTheme, useThemeStyles } from "components/ThemeProvider";

// Material-UI Icons
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import LanguageIcon from '@mui/icons-material/Language';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BusinessIcon from '@mui/icons-material/Business';
import EventIcon from '@mui/icons-material/Event';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CloseIcon from '@mui/icons-material/Close';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupIcon from '@mui/icons-material/Group';

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
      style={{ display: value === index ? 'block' : 'none' }}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
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
  const { colors, isDarkMode } = useTheme();
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Theme-aware styles
  const styles = useThemeStyles((colors, theme) => ({
    dialog: {
      '& .MuiDialog-paper': {
        background: colors.backgroundLight,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${colors.borderLight}`,
        boxShadow: theme.shadows.xl,
        overflow: 'hidden',
      }
    },
    header: {
      background: `linear-gradient(135deg, ${colors.backgroundAccent} 0%, ${colors.backgroundSubtle} 100%)`,
      borderBottom: `2px solid ${colors.borderLight}`,
      padding: theme.spacing.xl,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: colors.mainColor,
      }
    },
    closeButton: {
      position: 'absolute',
      top: theme.spacing.lg,
      right: theme.spacing.lg,
      backgroundColor: colors.backgroundLight,
      border: `1px solid ${colors.borderLight}`,
      color: colors.textSecondary,
      '&:hover': {
        backgroundColor: colors.backgroundAccent,
        color: colors.textPrimary,
      }
    },
    avatarContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.lg,
    },
    avatar: {
      width: '72px',
      height: '72px',
      background: colors.mainColor,
      border: `3px solid ${colors.backgroundLight}`,
      boxShadow: theme.shadows.md,
      fontSize: '1.8rem',
      fontFamily: theme.typography.font1.bold,
      color: 'white',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      color: colors.textPrimary,
      fontFamily: theme.typography.font1.bold,
      marginBottom: theme.spacing.xs,
      fontSize: '1.5rem',
    },
    userEmail: {
      color: colors.textSecondary,
      fontFamily: theme.typography.font2.regular,
      marginBottom: theme.spacing.sm,
      fontSize: '1rem',
    },
    statusChip: {
      fontFamily: theme.typography.font2.medium,
      borderRadius: theme.borderRadius.md,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontSize: '0.75rem',
      fontWeight: '600',
    },
    tabs: {
      '& .MuiTabs-root': {
        borderBottom: `2px solid ${colors.borderLight}`,
        backgroundColor: colors.backgroundAccent,
      },
      '& .MuiTab-root': {
        fontFamily: theme.typography.font2.medium,
        textTransform: 'none',
        fontSize: '0.9rem',
        color: colors.textSecondary,
        fontWeight: '500',
        minHeight: '60px',
        '&.Mui-selected': {
          color: colors.mainColor,
          fontFamily: theme.typography.font2.bold,
          fontWeight: '700',
        }
      },
      '& .MuiTabs-indicator': {
        backgroundColor: colors.mainColor,
        height: '3px',
      }
    },
    contentArea: {
      padding: theme.spacing.xl,
      backgroundColor: colors.backgroundLight,
      minHeight: '400px',
    },
    infoCard: {
      backgroundColor: colors.backgroundAccent,
      borderRadius: theme.borderRadius.lg,
      border: `1px solid ${colors.borderLight}`,
      marginBottom: theme.spacing.lg,
      boxShadow: theme.shadows.sm,
      '&:hover': {
        boxShadow: theme.shadows.md,
      }
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontFamily: theme.typography.font1.bold,
      marginBottom: theme.spacing.lg,
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      fontSize: '0.85rem',
      fontWeight: '700',
      borderBottom: `1px solid ${colors.borderLight}`,
      paddingBottom: theme.spacing.sm,
    },
    fieldContainer: {
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: colors.backgroundLight,
      border: `1px solid ${colors.borderLight}`,
    },
    fieldLabel: {
      color: colors.textSecondary,
      fontFamily: theme.typography.font2.bold,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      marginBottom: theme.spacing.xs,
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.xs,
      fontWeight: '600',
    },
    fieldValue: {
      color: colors.textPrimary,
      fontFamily: theme.typography.font1.regular,
      fontSize: '0.95rem',
      lineHeight: 1.4,
      fontWeight: '500',
    },
    chipContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    dataChip: {
      backgroundColor: colors.backgroundSubtle,
      color: colors.textPrimary,
      border: `1px solid ${colors.borderLight}`,
      fontFamily: theme.typography.font2.medium,
      fontSize: '0.75rem',
      borderRadius: theme.borderRadius.sm,
      fontWeight: '500',
    },
    iconButton: {
      color: colors.mainColor,
      fontSize: '1rem',
    },
    userTypeIndicator: {
      backgroundColor: colors.mainColor,
      borderRadius: '50%',
      padding: '4px',
      border: `2px solid ${colors.backgroundLight}`,
    }
  }));
  
  // Format method for readability
  const formatValue = (value) => {
    if (value === null || value === undefined) return "Not specified";
    if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "None";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object" && value instanceof Date) return value.toLocaleString();
    if (typeof value === "string" && value.trim() === "") return "Not specified";
    return value.toString();
  };
  
  // Enhanced field renderer with icons
  const renderField = (label, value, icon = null) => (
    <MDBox sx={styles.fieldContainer}>
      <MDTypography sx={styles.fieldLabel}>
        {icon && <Icon sx={styles.iconButton}>{icon}</Icon>}
        {label}
      </MDTypography>
      <MDTypography sx={styles.fieldValue}>
        {formatValue(value)}
      </MDTypography>
    </MDBox>
  );

  // Render array as chips
  const renderChipField = (label, array, mapFunction = null, icon = null) => {
    if (!array || !Array.isArray(array) || array.length === 0) {
      return renderField(label, "None", icon);
    }
    
    return (
      <MDBox sx={styles.fieldContainer}>
        <MDTypography sx={styles.fieldLabel}>
          {icon && <Icon sx={styles.iconButton}>{icon}</Icon>}
          {label}
        </MDTypography>
        <MDBox sx={styles.chipContainer}>
          {array.map((item, index) => (
            <Chip
              key={index}
              label={mapFunction ? mapFunction(item) : item}
              sx={styles.dataChip}
              size="small"
            />
          ))}
        </MDBox>
      </MDBox>
    );
  };
  
  // Get user type information
  const getUserTypeInfo = (userType) => {
    switch (userType) {
      case 0: return { name: "Administrator", icon: AdminPanelSettingsIcon, color: "error" };
      case 1: return { name: "Professional", icon: PsychologyIcon, color: "info" };
      case 2: return { name: "Client", icon: GroupIcon, color: "success" };
      default: return { name: `Type ${userType}`, icon: PersonIcon, color: "default" };
    }
  };

  // Get verification status
  const getVerificationStatus = (user) => {
    if (user.emailVerified) {
      return { label: "Verified", color: "success", icon: "verified_user" };
    }
    return { label: "Unverified", color: "info", icon: "pending" };
  };
  
  if (!user) return null;
  
  const userTypeInfo = getUserTypeInfo(user.userType);
  const verificationStatus = getVerificationStatus(user);
  const UserTypeIcon = userTypeInfo.icon;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={styles.dialog}
    >
      {/* Professional Header */}
      <MDBox sx={styles.header}>
        <IconButton
          onClick={onClose}
          sx={styles.closeButton}
        >
          <CloseIcon />
        </IconButton>
        
        <MDBox sx={styles.avatarContainer}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            badgeContent={
              <Box sx={styles.userTypeIndicator}>
                <UserTypeIcon sx={{ fontSize: '0.9rem', color: 'white' }} />
              </Box>
            }
          >
            <MDAvatar sx={styles.avatar}>
              {user.username?.charAt(0)?.toUpperCase() || userTypeInfo.name.charAt(0)}
            </MDAvatar>
          </Badge>
          
          <MDBox sx={styles.userInfo}>
            <MDTypography sx={styles.userName}>
              {user.username || 'Unknown User'}
            </MDTypography>
            <MDTypography sx={styles.userEmail}>
              {user.email || 'No email provided'}
            </MDTypography>
            <MDBox display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip 
                label={user.isBlocked ? "Blocked" : "Active"} 
                color={user.isBlocked ? "error" : "success"} 
                size="small"
                sx={styles.statusChip}
              />
              <Chip 
                label={verificationStatus.label}
                color={verificationStatus.color}
                icon={<Icon>{verificationStatus.icon}</Icon>}
                size="small"
                sx={styles.statusChip}
              />
              <Chip 
                label={userTypeInfo.name}
                color={userTypeInfo.color}
                size="small"
                sx={styles.statusChip}
              />
            </MDBox>
          </MDBox>
        </MDBox>
      </MDBox>
      
      <DialogContent sx={{ padding: 0 }}>
        {/* Professional Tabs */}
        <MDBox sx={styles.tabs}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab label="Account Information" icon={<PersonIcon />} />
            {user.userType === 1 && <Tab label="Professional Profile" icon={<PsychologyIcon />} />}
            {user.userType === 2 && <Tab label="Client Profile" icon={<GroupIcon />} />}
            <Tab label="System Data" icon={<Icon>settings</Icon>} />
          </Tabs>
        </MDBox>
        
        <MDBox sx={styles.contentArea}>
          {/* Basic Account Information */}
          <TabPanel value={tabValue} index={0}>
            <MDTypography variant="h6" sx={{ mb: 2 }}>
              Account Information Tab Content
            </MDTypography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={styles.infoCard}>
                  <CardContent>
                    <MDTypography sx={styles.sectionTitle}>
                      <PersonIcon sx={styles.iconButton} />
                      Account Details
                    </MDTypography>
                    
                    {renderField("Username", user.username || "Not provided", "account_circle")}
                    {renderField("Email Address", user.email || "Not provided", "email")}
                    {renderField("User Type", userTypeInfo.name, "badge")}
                    {user.roleNames && renderChipField("Assigned Roles", user.roleNames, null, "admin_panel_settings")}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={styles.infoCard}>
                  <CardContent>
                    <MDTypography sx={styles.sectionTitle}>
                      <VerifiedUserIcon sx={styles.iconButton} />
                      Security & Status
                    </MDTypography>
                    
                    {renderField("Account Status", user.isBlocked ? "Blocked" : "Active", "security")}
                    {renderField("Email Verified", user.emailVerified ? "Yes" : "No", "verified")}
                    {renderField("Account Created", user.createdAt ? new Date(user.createdAt).toLocaleString() : "Not available", "event")}
                    {renderField("Last Updated", user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "Not available", "update")}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Professional Details */}
          {user.userType === 1 && (
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={styles.infoCard}>
                    <CardContent>
                      <MDTypography sx={styles.sectionTitle}>
                        <PersonIcon sx={styles.iconButton} />
                        Personal Information
                      </MDTypography>
                      
                      {renderField("First Name", user.professional?.firstName || "Not provided", "person")}
                      {renderField("Last Name", user.professional?.lastName || "Not provided", "person")}
                      {renderField("Date of Birth", user.professional?.dob ? new Date(user.professional.dob).toLocaleDateString() : "Not provided", "cake")}
                      {renderField("Gender", user.professional?.gender !== undefined ? getGenderLabel(user.professional.gender) : "Not specified", "wc")}
                      {renderField("Mother Tongue", user.professional?.motherTongue !== undefined ? getLanguageLabel(user.professional.motherTongue) : "Not specified", "translate")}
                    </CardContent>
                  </Card>
                  
                  <Card sx={styles.infoCard}>
                    <CardContent>
                      <MDTypography sx={styles.sectionTitle}>
                        <WorkIcon sx={styles.iconButton} />
                        Professional Information
                      </MDTypography>
                      
                      {renderField("Professional Type", user.professional?.profType !== undefined ? getProfTypeLabel(user.professional.profType) : "Not specified", "psychology")}
                      {renderField("Business Name", user.professional?.businessName || "Not provided", "business")}
                      {renderField("Meeting Type", user.professional?.meetType !== undefined ? getMeetTypeLabel(user.professional.meetType) : "Not specified", "meeting_room")}
                      {renderField("Education Institute", user.professional?.eduInstitute !== undefined ? getEduInstituteLabel(user.professional.eduInstitute) : "Not specified", "school")}
                      {renderField("Other Education", user.professional?.eduInstStr || "Not provided", "school")}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={styles.infoCard}>
                    <CardContent>
                      <MDTypography sx={styles.sectionTitle}>
                        <EmailIcon sx={styles.iconButton} />
                        Contact Information
                      </MDTypography>
                      
                      {renderField("Business Email", user.professional?.bussEmail || "Not provided", "email")}
                      {renderField("Business Phone", user.professional?.bussPhoneNb || "Not provided", "phone")}
                      {renderField("Phone Number", user.professional?.phoneNb ? JSON.stringify(user.professional.phoneNb) : "Not provided", "phone")}
                      {renderField("Business Address", user.professional?.addressObj ? formatAddress(user.professional.addressObj) : "Not provided", "location_on")}
                    </CardContent>
                  </Card>
                  
                  <Card sx={styles.infoCard}>
                    <CardContent>
                      <MDTypography sx={styles.sectionTitle}>
                        <LanguageIcon sx={styles.iconButton} />
                        Services & Specializations
                      </MDTypography>
                      
                      {user.professional?.servOfferedArr ? renderChipField("Services Offered", user.professional.servOfferedArr, getServiceLabel, "medical_services") : renderField("Services Offered", "Not specified", "medical_services")}
                      {user.professional?.offeredLangArr ? renderChipField("Languages Offered", user.professional.offeredLangArr, getLanguageLabel, "language") : renderField("Languages Offered", "Not specified", "language")}
                      {user.professional?.expertises ? renderChipField("Expertises", user.professional.expertises, getExpertiseLabel, "psychology") : renderField("Expertises", "Not specified", "psychology")}
                      {user.professional?.servedClientele ? renderChipField("Client Groups", user.professional.servedClientele, getClienteleLabel, "group") : renderField("Client Groups", "Not specified", "group")}
                      {user.professional?.thirdPartyPayers ? renderChipField("Third Party Payers", user.professional.thirdPartyPayers, getPayerLabel, "payment") : renderField("Third Party Payers", "Not specified", "payment")}
                    </CardContent>
                  </Card>
                  
                  <Card sx={styles.infoCard}>
                    <CardContent>
                      <MDTypography sx={styles.sectionTitle}>
                        <BusinessIcon sx={styles.iconButton} />
                        Business & Tax Information
                      </MDTypography>
                      
                      {renderField("Tax Information", user.professional?.taxInfo ? formatTaxInfo(user.professional.taxInfo) : "Not provided", "receipt")}
                      {renderField("Professional Order", user.professional?.partOfOrder ? formatOrderInfo(user.professional.partOfOrder) : "Not provided", "card_membership")}
                      {renderField("Psychotherapy Order", user.professional?.partOfPsychoOrder ? formatOrderInfo(user.professional.partOfPsychoOrder) : "Not provided", "psychology")}
                    </CardContent>
                  </Card>
                  
                  <Card sx={styles.infoCard}>
                    <CardContent>
                      <MDTypography sx={styles.sectionTitle}>
                        <EventIcon sx={styles.iconButton} />
                        Availability & Schedule
                      </MDTypography>
                      
                      {renderField("Availability", user.professional?.availability ? formatAvailability(user.professional.availability) : "Not specified", "schedule")}
                      {user.professional?.allSubcategsArr ? renderChipField("All Subcategories", user.professional.allSubcategsArr, null, "category") : renderField("All Subcategories", "Not specified", "category")}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          )}
          
          {/* Client Details */}
          {user.userType === 2 && (
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={styles.infoCard}>
                    <CardContent>
                      <MDTypography sx={styles.sectionTitle}>
                        <PersonIcon sx={styles.iconButton} />
                        Personal Information
                      </MDTypography>
                      
                      {renderField("First Name", user.client?.firstName || "Not provided", "person")}
                      {renderField("Last Name", user.client?.lastName || "Not provided", "person")}
                      {renderField("Date of Birth", user.client?.dob ? new Date(user.client.dob).toLocaleDateString() : "Not provided", "cake")}
                      {renderField("Gender", user.client?.gender !== undefined ? getGenderLabel(user.client.gender) : "Not specified", "wc")}
                    </CardContent>
                  </Card>
                  
                  <Card sx={styles.infoCard}>
                    <CardContent>
                      <MDTypography sx={styles.sectionTitle}>
                        <PhoneIcon sx={styles.iconButton} />
                        Contact Information
                      </MDTypography>
                      
                      {renderField("Phone Number", user.client?.phoneNb || "Not provided", "phone")}
                      {renderField("Address", user.client?.addressObj ? formatAddress(user.client.addressObj) : "Not provided", "location_on")}
                      {renderField("Location", user.client?.geoPt ? `${user.client.geoPt.latitude}, ${user.client.geoPt.longitude}` : "Not provided", "place")}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={styles.infoCard}>
                    <CardContent>
                      <MDTypography sx={styles.sectionTitle}>
                        <LanguageIcon sx={styles.iconButton} />
                        Preferences
                      </MDTypography>
                      
                      {user.client?.spokenLangArr ? renderChipField("Languages Spoken", user.client.spokenLangArr, getLanguageLabel, "language") : renderField("Languages Spoken", "Not specified", "language")}
                      {renderField("Search Radius", user.client?.searchRadius ? `${user.client.searchRadius} km` : "Not specified", "radar")}
                    </CardContent>
                  </Card>
                  
                  <Card sx={styles.infoCard}>
                    <CardContent>
                      <MDTypography sx={styles.sectionTitle}>
                        <LocationOnIcon sx={styles.iconButton} />
                        Location Details
                      </MDTypography>
                      
                      {user.client?.geoPt ? renderField("GPS Coordinates", `${user.client.geoPt.latitude.toFixed(6)}, ${user.client.geoPt.longitude.toFixed(6)}`, "gps_fixed") : renderField("GPS Coordinates", "Not available", "gps_fixed")}
                      {user.client?.addressObj && Object.keys(user.client.addressObj).length > 0 ? (
                        <MDBox sx={styles.fieldContainer}>
                          <MDTypography sx={styles.fieldLabel}>
                            <Icon sx={styles.iconButton}>home</Icon>
                            Address Details
                          </MDTypography>
                          <MDBox sx={styles.chipContainer}>
                            {Object.entries(user.client.addressObj).map(([key, value], index) => (
                              <Chip
                                key={index}
                                label={`${key}: ${value}`}
                                sx={styles.dataChip}
                                size="small"
                              />
                            ))}
                          </MDBox>
                        </MDBox>
                      ) : renderField("Address Details", "Not available", "home")}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          )}
          
          {/* System Data */}
          <TabPanel value={tabValue} index={user.userType === 0 ? 1 : 2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={styles.infoCard}>
                  <CardContent>
                    <MDTypography sx={styles.sectionTitle}>
                      <Icon sx={styles.iconButton}>storage</Icon>
                      Database Information
                    </MDTypography>
                    
                    {renderField("Object ID", user.objectId || user.id, "fingerprint")}
                    {renderField("Created At", new Date(user.createdAt).toLocaleString(), "schedule")}
                    {renderField("Updated At", new Date(user.updatedAt).toLocaleString(), "update")}
                    {user.userType !== undefined && renderField("User Type Code", user.userType, "code")}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={styles.infoCard}>
                  <CardContent>
                    <MDTypography sx={styles.sectionTitle}>
                      <Icon sx={styles.iconButton}>devices</Icon>
                      Device Information
                    </MDTypography>
                    
                    {user.userInfo ? (
                      Object.entries(user.userInfo).map(([platform, info], index) => (
                        <MDBox key={index} sx={styles.fieldContainer}>
                          <MDTypography sx={styles.fieldLabel}>
                            Platform: {platform}
                          </MDTypography>
                          <MDTypography sx={styles.fieldValue}>
                            App: {info.appV || 'N/A'} | Device: {info.devMod || 'N/A'} | OS: {info.os || 'N/A'} {info.osV || ''}
                          </MDTypography>
                        </MDBox>
                      ))
                    ) : (
                      renderField("Device Info", "No device information available", "devices")
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </MDBox>
      </DialogContent>
    </Dialog>
  );
}

UserDetail.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default UserDetail;

// Enhanced helper functions for labels
const getProfTypeLabel = (code) => {
  const types = {
    0: "Psychologist",
    1: "Clinical Psychologist", 
    2: "Counseling Psychologist",
    3: "School Psychologist",
    4: "Social Worker",
    5: "Psychotherapist",
    6: "Marriage and Family Therapist",
    7: "Licensed Professional Counselor",
    8: "Psychiatrist",
    9: "Psychoeducator",
    10: "Art Therapist",
    11: "Music Therapist",
    12: "Occupational Therapist"
  };
  return types[code] || `Professional Type ${code}`;
};

const getMeetTypeLabel = (code) => {
  const types = {
    0: "In-Person Only",
    1: "Online Only", 
    2: "Both In-Person and Online",
    3: "Home Visits",
    4: "Workplace Visits"
  };
  return types[code] || `Meeting Type ${code}`;
};

const getGenderLabel = (code) => {
  const genders = {
    0: "Male",
    1: "Female", 
    2: "Non-Binary",
    3: "Other",
    4: "Prefer not to say"
  };
  return genders[code] || `Gender ${code}`;
};

const getLanguageLabel = (code) => {
  const languages = {
    0: "English",
    1: "French",
    2: "Spanish", 
    3: "Mandarin",
    4: "Arabic",
    5: "Portuguese",
    6: "Italian",
    7: "German",
    8: "Russian",
    9: "Japanese",
    10: "Korean",
    11: "Hindi"
  };
  return languages[code] || `Language ${code}`;
};

const getServiceLabel = (code) => {
  const services = {
    0: "Individual Psychotherapy",
    1: "Group Therapy",
    2: "Couples Therapy", 
    3: "Family Therapy",
    4: "Psychological Assessment",
    5: "Neuropsychological Assessment",
    6: "Career Counseling",
    7: "Addiction Counseling",
    8: "Trauma Therapy",
    9: "Cognitive Behavioral Therapy",
    10: "Dialectical Behavior Therapy",
    11: "EMDR Therapy",
    12: "Art Therapy",
    13: "Play Therapy"
  };
  return services[code] || `Service ${code}`;
};

const getExpertiseLabel = (code) => {
  const expertises = {
    0: "Anxiety Disorders",
    1: "Depression",
    2: "Trauma and PTSD",
    3: "Addiction and Substance Abuse",
    4: "Eating Disorders", 
    5: "Bipolar Disorder",
    6: "ADHD",
    7: "Autism Spectrum Disorders",
    8: "Personality Disorders",
    9: "Grief and Loss",
    10: "Relationship Issues",
    11: "Stress Management",
    12: "Anger Management",
    13: "Sleep Disorders",
    14: "Chronic Pain",
    15: "Life Transitions"
  };
  return expertises[code] || `Expertise ${code}`;
};

const getEduInstituteLabel = (code) => {
  const institutes = {
    0: "McGill University",
    1: "University of Toronto",
    2: "University of British Columbia",
    3: "University of Montreal", 
    4: "Université Laval",
    5: "University of Alberta",
    6: "University of Calgary",
    7: "University of Ottawa",
    8: "York University",
    9: "Concordia University",
    10: "Other Institution"
  };
  return institutes[code] || `Institute ${code}`;
};

const getClienteleLabel = (code) => {
  const clientele = {
    0: "Adults (18+)",
    1: "Adolescents (13-17)",
    2: "Children (5-12)",
    3: "Young Children (2-4)",
    4: "Seniors (65+)",
    5: "Couples",
    6: "Families",
    7: "Groups"
  };
  return clientele[code] || `Clientele ${code}`;
};

const getPayerLabel = (code) => {
  const payers = {
    0: "CNESST",
    1: "SAAQ", 
    2: "IVAC",
    3: "Veterans Affairs",
    4: "Private Insurance",
    5: "EAP Programs",
    6: "Self-Pay"
  };
  return payers[code] || `Payer ${code}`;
};

const formatAddress = (addressObj) => {
  if (!addressObj || typeof addressObj !== 'object') return 'No address provided';
  
  const parts = [];
  if (addressObj.street) parts.push(addressObj.street);
  if (addressObj.city) parts.push(addressObj.city);
  if (addressObj.state || addressObj.province) parts.push(addressObj.state || addressObj.province);
  if (addressObj.postalCode || addressObj.zip) parts.push(addressObj.postalCode || addressObj.zip);
  if (addressObj.country) parts.push(addressObj.country);
  
  return parts.length > 0 ? parts.join(', ') : 'Address information incomplete';
};

// Helper functions for formatting Professional data
const formatTaxInfo = (taxInfo) => {
  if (!taxInfo || typeof taxInfo !== 'object') return 'No tax information provided';
  
  const parts = [];
  if (taxInfo.gstNumber) parts.push(`GST: ${taxInfo.gstNumber}`);
  if (taxInfo.qstNumber) parts.push(`QST: ${taxInfo.qstNumber}`);
  if (taxInfo.businessNumber) parts.push(`Business #: ${taxInfo.businessNumber}`);
  
  return parts.length > 0 ? parts.join(' | ') : 'Tax information incomplete';
};

const formatOrderInfo = (orderInfo) => {
  if (!orderInfo || typeof orderInfo !== 'object') return 'No order information provided';
  
  const parts = [];
  if (orderInfo.orderName) parts.push(`Order: ${orderInfo.orderName}`);
  if (orderInfo.memberNumber) parts.push(`Member #: ${orderInfo.memberNumber}`);
  if (orderInfo.validUntil) parts.push(`Valid until: ${new Date(orderInfo.validUntil).toLocaleDateString()}`);
  if (orderInfo.status) parts.push(`Status: ${orderInfo.status}`);
  
  return parts.length > 0 ? parts.join(' | ') : 'Order information incomplete';
};

const formatAvailability = (availability) => {
  if (!availability || !Array.isArray(availability) || availability.length === 0) {
    return 'No availability information provided';
  }
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return availability.map(slot => {
    if (typeof slot === 'object' && slot.day !== undefined) {
      const dayName = dayNames[slot.day] || `Day ${slot.day}`;
      const timeInfo = slot.startTime && slot.endTime ? 
        ` (${slot.startTime} - ${slot.endTime})` : '';
      return `${dayName}${timeInfo}`;
    }
    return slot.toString();
  }).join(', ');
}; 