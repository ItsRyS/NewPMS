import * as React from "react";
import PropTypes from "prop-types";
import {
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

// แก้ไขตำแหน่ง import colorSchemes
import { colorSchemes } from "/src/utils/shared-theme/themePrimitives";

function AppTheme({ children, disableCustomTheme, themeComponents }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = React.useMemo(() => {
    if (disableCustomTheme) return {};

    const selectedColorScheme = prefersDarkMode
      ? colorSchemes.dark.palette
      : colorSchemes.light.palette;

    let baseTheme = createTheme({
      palette: selectedColorScheme,
      typography: {
        fontFamily: "Prompt, sans-serif",
        h1: { fontSize: "2.5rem" },
        h2: { fontSize: "2rem" },
        h3: { fontSize: "1.75rem" },
        body1: { fontSize: "1rem" },
        body2: { fontSize: "0.875rem" },
      },
      breakpoints: {
        values: {
          xs: 0,
          sm: 600,
          md: 900,
          lg: 1200,
          xl: 1536,
        },
      },
      components: {
        ...themeComponents,
      },
    });

    baseTheme = responsiveFontSizes(baseTheme);

    return baseTheme;
  }, [prefersDarkMode, disableCustomTheme, themeComponents]);

  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

AppTheme.propTypes = {
  children: PropTypes.node,
  disableCustomTheme: PropTypes.bool,
  themeComponents: PropTypes.object,
};

export default AppTheme;
