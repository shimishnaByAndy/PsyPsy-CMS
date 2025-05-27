// prop-types is a library for typechecking of props
import PropTypes from "prop-types";
import { useTranslation } from 'react-i18next';

// @mui material components
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React base styles
import typography from "assets/theme/base/typography";

function CustomFooter({ light }) {
  const { size } = typography;
  const { t } = useTranslation();

  return (
    <MDBox
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      px={1.5}
    >
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        fontSize={size.sm}
        px={1.5}
        sx={{ color: light ? "white" : "#9e9e9e" }}
      >
        {t('footer.madeWith')}
        <MDBox 
          fontSize={size.md} 
          mb={-0.5} 
          mx={0.25}
          sx={{ color: light ? "white" : "#9e9e9e" }}
        >
          <Icon color="inherit" fontSize="inherit">
            favorite
          </Icon>
        </MDBox>
        {t('footer.in')}
      </MDBox>
    </MDBox>
  );
}

// Setting default props for the CustomFooter
CustomFooter.defaultProps = {
  light: false,
};

// Typechecking props for the CustomFooter
CustomFooter.propTypes = {
  light: PropTypes.bool,
};

export default CustomFooter; 