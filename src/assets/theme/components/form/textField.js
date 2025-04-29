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

// Material Dashboard 2 React Base Styles
import colors from "assets/theme/base/colors";

const { transparent } = colors;

const textField = {
  styleOverrides: {
    root: {
      backgroundColor: transparent.main,
      
      "& .MuiInputLabel-root": {
        color: "#AD9E93", // hintTxt color from mobile app
        
        "&.Mui-focused": {
          color: "#AD9E93" // keep the same color when focused
        }
      },
      
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#B3B8A2", // accent2 color
        },
        "&:hover fieldset": {
          borderColor: "#899581", // mainColor
        },
        "&.Mui-focused fieldset": {
          borderColor: "#899581", // mainColor
        }
      }
    },
  },
};

export default textField;
