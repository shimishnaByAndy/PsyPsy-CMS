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
        color={light ? "white" : "text"}
        fontSize={size.sm}
        px={1.5}
      >
        {t('footer.madeWith')}
        <MDBox fontSize={size.md} color={light ? "white" : "dark"} mb={-0.5} mx={0.25}>
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