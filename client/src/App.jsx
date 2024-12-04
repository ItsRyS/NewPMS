import AppRoutes from "./AppRoutes/AppRoutes";
import AppTheme from "./utils/shared-theme/AppTheme";
import { CssBaseline } from "@mui/material";
function App() {
  return (
    <AppTheme>
      <CssBaseline />
      <AppRoutes />
    </AppTheme>
  );
}

export default App;
