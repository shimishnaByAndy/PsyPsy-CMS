/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// Material Dashboard 2 React base styles
import colors from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";
import boxShadows from "assets/theme/base/boxShadows";

// Material Dashboard 2 React helper functions
import pxToRem from "assets/theme/functions/pxToRem";
import rgba from "assets/theme/functions/rgba";

const { white, grey, black, primary } = colors;
const { borderWidth, borderRadius } = borders;
const { md } = boxShadows;

const switchButton = {
  defaultProps: {
    disableRipple: true,
  },

  styleOverrides: {
    switchBase: {
      color: grey[300],
      padding: 0,
      
      "&:hover": {
        backgroundColor: rgba(grey[300], 0.15),
      },

      "&.Mui-checked": {
        color: primary.main,
        padding: 0,
        transform: `translateX(${pxToRem(16)})`,

        "&:hover": {
          backgroundColor: rgba(primary.main, 0.15),
        },

        "& .MuiSwitch-thumb": {
          borderColor: `${primary.main} !important`,
        },

        "& + .MuiSwitch-track": {
          backgroundColor: `${primary.main} !important`,
          borderColor: `${primary.main} !important`,
          opacity: 1,
        },
      },

      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: "0.3 !important",
      },

      "&.Mui-focusVisible .MuiSwitch-thumb": {
        boxShadow: md,
      },
    },

    thumb: {
      width: pxToRem(18),
      height: pxToRem(18),
      backgroundColor: white.main,
      boxShadow: md,
      border: `${borderWidth[1]} solid ${grey[400]}`,
      position: 'relative',
      top: '-1px',

      "&:hover": {
        boxShadow: "none",
      },
    },

    track: {
      width: pxToRem(36),
      height: pxToRem(16),
      backgroundColor: grey[400],
      border: `${borderWidth[1]} solid ${grey[400]}`,
      opacity: 1,
      borderRadius: borderRadius.xl,
    },

    checked: {},
  },
};

export default switchButton;
