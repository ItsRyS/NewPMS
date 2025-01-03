import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Box,
  TextField,
  MenuItem,
  Button,
  Modal,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
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
        const formattedProjects = response.data.data.map((project) => ({
          ...project,
          project_create_time: moment(project.project_create_time).format(
            "DD/MM/YYYY"
          ),
        }));
        setProjects(formattedProjects);
      } catch (error) {
        console.error(
          "Error fetching projects:",
          error.response?.data || error.message
        );
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
    {
      field: "project_name_th",
      headerName: "ชื่อโครงการ (TH)",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "project_name_eng",
      headerName: "ชื่อโครงการ (EN)",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "team_members",
      headerName: "สมาชิกในทีม",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.2 }}>
          {params.row.team_members
            ? params.row.team_members
                .split(", ")
                .map((member, index) => (
                  <Typography key={index}>{member}</Typography>
                ))
            : "ไม่มีสมาชิก"}
        </Box>
      ),
    },
    {
      field: "project_advisor",
      headerName: "ที่ปรึกษา",
      flex: 0.5,
      minWidth: 120,
    },
    { field: "project_type", headerName: "ประเภท", flex: 0.5, minWidth: 100 },
    {
      field: "project_status",
      headerName: "สถานะ",
      flex: 0.3,
      minWidth: 100,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "project_create_time",
      headerName: "วันที่สร้าง",
      flex: 0.3,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "view_document",
      headerName: "รายละเอียดเอกสาร",
      flex: 0.5,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            handleOpen(`http://localhost:5000/${params.row.project_path}`)
          }
          disabled={!params.row.project_path}
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Container sx={{ py: 4, marginTop: "70px", flex: 1 }}>
          {/* Search Section */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="ค้นหาตาม"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                fullWidth
              >
                <MenuItem value="project_name_th">ชื่อโครงการ (TH)</MenuItem>
                <MenuItem value="project_name_eng">ชื่อโครงการ (EN)</MenuItem>
                <MenuItem value="project_advisor">ที่ปรึกษา</MenuItem>
                <MenuItem value="team_members">สมาชิกในทีม</MenuItem>
                <MenuItem value="project_type">ประเภท</MenuItem>
                <MenuItem value="project_status">สถานะ</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                placeholder="ค้นหาข้อมูล"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>

          {/* DataGrid Section */}
          <Paper elevation={3} sx={{ height: 500, p: 2 }}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
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
          </Paper>
        </Container>

        {/* PDF Viewer Modal */}
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
                <Typography>ไม่มีเอกสาร</Typography>
              )}
            </Worker>
          </Box>
        </Modal>
        <FooterHome />
      </Box>
    </>
  );
};

export default Home;
