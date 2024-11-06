import { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import NavbarHome from "../components/Layout/navbarHome";
import FooterHome from "../components/Layout/footerHome";
import { DataGrid } from "@mui/x-data-grid";
import { TextField, MenuItem, Button, Modal } from "@mui/material";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import moment from "moment"; // Ensure moment is installed
import api from "../services/api"; // Axios instance

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("project_name_th");
  const [open, setOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState("");

  useEffect(() => {
    api
      .get("/projects")
      .then((response) => {
        // Format date using moment.js
        const formattedProjects = response.data.map((project) => ({
          ...project,
          project_create_time: moment(project.project_create_time).format("DD/MM/YYYY"), // Adjust date format as needed
        }));
        setProjects(formattedProjects);
      })
      .catch((error) => console.error("Error fetching projects:", error));
  }, []);

  const handleOpen = (documentPath) => {
    setSelectedDocument(documentPath);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDocument("");
  };

  const columns = [
    { field: "project_name_th", headerName: "ชื่อโครงการ (TH)", flex: 1 },
    { field: "project_name_eng", headerName: "ชื่อโครงการ (EN)", flex: 1 },
    { field: "project_owner", headerName: "เจ้าของโครงการ", flex: 0.5 },
    { field: "project_type", headerName: "ประเภท", flex: 0.5 },
    {
      field: "project_status",
      headerName: "สถานะ",
      flex: 0.3,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "project_create_time",
      headerName: "วันที่สร้าง",
      flex: 0.3,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "view_document",
      headerName: "รายละเอียดเอกสาร",
      flex: 0.5,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            handleOpen(`http://localhost:5000/upload/Document/${params.row.view_document}`) // Adjust URL as needed
          }
          disabled={!params.row.view_document} // Disable button if document path is missing
        >
          ดูเอกสาร
        </Button>
      ),
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
      <NavbarHome />
      <Container
        className="content-main"
        maxWidth={false}
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
              sx={{ width: 200 }}
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

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            height: "80%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            {selectedDocument ? (
              <Viewer fileUrl={selectedDocument} />
            ) : (
              <p>No document selected</p>
            )}
          </Worker>
        </Box>
      </Modal>
      <FooterHome />
    </>
  );
};

export default Home;
