import { Box, Typography, IconButton } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailIcon from "@mui/icons-material/Email";

const FooterHome = () => {
  return (
    <Box
      component="footer"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" }, // Stack on small screens
        alignItems: "center",
        justifyContent: "space-between", // Space between text and icons
        padding: "16px",
        backgroundColor: "#110f01",
        color: "#f0f4f8",
        width: "100%",
        boxSizing: "border-box",
        mt: "auto", // Push footer to the bottom
      }}
    >
      {/* Footer Text */}
      <Typography variant="body2" align="center" sx={{ mb: { xs: 1, sm: 0 } }}>
        สงวนลิขสิทธิ์ © 2567 - ข้อมูลและเนื้อหาทั้งหมด - บริษัท ไลลาร์ เพอฟอร์ม
        จำกัด
      </Typography>

      {/* Footer Icons */}
      <Box sx={{ display: "flex", gap: "8px" }}>
        <IconButton
          href="https://github.com/ItsRyS"
          target="_blank"
          sx={{ color: "#f0f4f8" }}
        >
          <GitHubIcon />
        </IconButton>
        <IconButton
          href="mailto:ForzaLyraBelil@outlook.com"
          sx={{ color: "#f0f4f8" }}
        >
          <EmailIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default FooterHome;
