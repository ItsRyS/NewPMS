import { DataGrid } from '@mui/x-data-grid';
import {  Box, Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const ProjectTable = ({ rows, columns, loading }) => {
  return (
    <Paper elevation={3} sx={{ height: 500, p: 2 }}>
      {rows.length === 0 && !loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography variant="h6" color="textSecondary">
            ยังไม่มีโครงงาน
          </Typography>
        </Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          getRowId={(row) => row.project_id}
        />
      )}
    </Paper>
  );
};
ProjectTable.propTypes = {
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default ProjectTable;
