import * as React from "react";
import PropTypes from "prop-types";
import { ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material/styles";

// Import customizations
import { inputsCustomizations } from "./customizations/inputs";
import { dataDisplayCustomizations } from "./customizations/dataDisplay";
import { feedbackCustomizations } from "./customizations/feedback";
import { navigationCustomizations } from "./customizations/navigation";
import { surfacesCustomizations } from "./customizations/surfaces";
import { colorSchemes, shadows, shape } from "./themePrimitives";

function AppTheme({ children, disableCustomTheme, themeComponents }) {
  const theme = React.useMemo(() => {
    if (disableCustomTheme) return {};

    // Create base theme
    let baseTheme = createTheme({
      // CSS Variables configuration
      cssVariables: {
        colorSchemeSelector: "data-mui-color-scheme",
        cssVarPrefix: "template",
      },
      // Light & Dark mode support
      colorSchemes,
      // Typography settings
      typography: {
        fontFamily: "Prompt, sans-serif",
        h1: { fontSize: "2.5rem" }, // Example for headings
        h2: { fontSize: "2rem" },
        h3: { fontSize: "1.75rem" },
        body1: { fontSize: "1rem" }, // Example for body text
        body2: { fontSize: "0.875rem" },
      },
      shadows,
      shape,
      // Breakpoints for responsive design
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
        ...inputsCustomizations,
        ...dataDisplayCustomizations,
        ...feedbackCustomizations,
        ...navigationCustomizations,
        ...surfacesCustomizations,
        ...themeComponents,
      },
    });

    // Apply responsive font sizes
    baseTheme = responsiveFontSizes(baseTheme);

    return baseTheme;
  }, [disableCustomTheme, themeComponents]);

  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}

AppTheme.propTypes = {
  children: PropTypes.node,
  /**
   * Disable the custom theme for specific cases (used mainly for debugging or testing).
   */
  disableCustomTheme: PropTypes.bool,
  /**
   * Additional theme components can be passed dynamically.
   */
  themeComponents: PropTypes.object,
};

export default AppTheme;
