import { useState, useEffect } from "react";
import { Container, Box, TextField, MenuItem, Button, Modal, Typography, CircularProgress } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import NavbarHome from "../../components/NavHome";
import FooterHome from "../../components/FooterHome";
import moment from "moment";
import api from "../../services/api";

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("project_name_th");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get("/projects");
        const formattedProjects = response.data.map((project) => ({
          ...project,
          project_create_time: moment(project.project_create_time).format("DD/MM/YYYY"),
        }));
        setProjects(formattedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
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
            handleOpen(`http://localhost:5000/upload/Document/${params.row.view_document}`)
          }
          disabled={!params.row.view_document}
        >
          ดูเอกสาร
        </Button>
      ),
    },
  ];

  const filteredProjects = projects.filter((project) =>
    project[searchField]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <NavbarHome />
      <Container sx={{ py: 4, minHeight: "90vh" ,marginTop: "70px"}}>
        <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
          <TextField
            select
            label="ค้นหาตาม"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="project_name_th">ชื่อโครงการ (TH)</MenuItem>
            <MenuItem value="project_name_eng">ชื่อโครงการ (EN)</MenuItem>
            <MenuItem value="project_owner">เจ้าของโครงการ</MenuItem>
            <MenuItem value="project_type">ประเภท</MenuItem>
            <MenuItem value="project_status">สถานะ</MenuItem>
          </TextField>
          <TextField
            placeholder="ค้นหาข้อมูล"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </Box>
        <Box sx={{ height: 400 }}>
          {loading ? (
            <CircularProgress />
          ) : (
            <DataGrid
              rows={filteredProjects}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              getRowId={(row) => row.project_id}
            />
          )}
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
            {selectedDocument ? <Viewer fileUrl={selectedDocument} /> : <Typography>ไม่มีเอกสาร</Typography>}
          </Worker>
        </Box>
      </Modal>
      <FooterHome />
    </>
  );
};

export default Home;
