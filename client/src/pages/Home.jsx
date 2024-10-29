import Container from "@mui/material/Container";
import Navbar from "../components/Layout/Navbar";
import Typography from "@mui/material/Typography";
import Footer from "../components/Layout/Footer";
const Home = () => {
  return (
    <>
      <Navbar /> 
      
      <Container
        className="search"
        maxWidth={false} 
        sx={{
          paddingTop: "80px",
          backgroundColor: "#b9e5e8",
          width: "100%",
          position: "fixed",
          padding: "16px",
          top: 65,
          left: 0,
          maxWidth: "100vw",
          boxSizing: "border-box",
        }}
      >
        <Typography variant="body2" color="textSecondary">
        dsfaasdfasdfadsf
      </Typography>
      </Container>
     <Footer />
    </>
  );
};

export default Home;
