import { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { TextField, MenuItem } from "@mui/material";

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("project_name_th");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/projects")
      .then((response) => setProjects(response.data))
      .catch((error) => console.error("Error fetching projects:", error));
  }, []);

  const columns = [
    {
      field: "project_name_th",
      headerName: "ชื่อโครงการ (TH)",
      flex: 1,
      headerAlign: "left",
    },
    {
      field: "project_name_eng",
      headerName: "ชื่อโครงการ (EN)",
      flex: 1,
      headerAlign: "left",
    },
    {
      field: "project_owner",
      headerName: "เจ้าของโครงการ",
      flex: 0.5,
      headerAlign: "left",
    },
    {
      field: "project_type",
      headerName: "ประเภท",
      flex: 0.5,
      headerAlign: "left",
    },
    {
      field: "project_status",
      headerName: "สถานะ",
      flex: 0.5,
      headerAlign: "center",
      align: 'center'
    },
    {
      field: "project_create_time",
      headerName: "วันที่สร้าง",
      flex: 0.5,
      headerAlign: "center",
      align: 'center'
    },
  ];

  const filteredProjects = projects.filter((project) =>
    project[searchField]
      ?.toString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <Container
        className="content-main"
        maxWidth="{false}" // จำกัดความกว้างของตารางตรงกลาง
        sx={{
          paddingTop: "auto",
          paddingBottom: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            width: "100%",
            backgroundColor: "#ffffff",
            padding: "24px",
            boxShadow: 10,
            borderRadius: "12px",
            
          }}
        >
          <Box sx={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            <TextField
              select
              label="ค้นหาตาม"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              variant="outlined"
              style={{ width: "200px" }}
            >
              <MenuItem value="project_name_th">ชื่อโครงการ (TH)</MenuItem>
              <MenuItem value="project_name_eng">ชื่อโครงการ (EN)</MenuItem>
              <MenuItem value="project_owner">เจ้าของโครงการ</MenuItem>
              <MenuItem value="project_type">ประเภท</MenuItem>
              <MenuItem value="project_status">สถานะ</MenuItem>
            </TextField>

            <TextField
              type="text"
              placeholder="ค้นหาข้อมูล"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              fullWidth
            />
          </Box>

          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={filteredProjects}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              getRowId={(row) => row.project_id}
            />
          </div>
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default Home;
