
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { Home, School, Assignment, AccountCircle, Logout } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const drawerWidth = 240;

const SideStudent = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawerContent = (
        <div>
            <List>
                <NavLink to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <ListItem button>
                        <ListItemIcon><Home /></ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItem>
                </NavLink>
                <NavLink to="/courses" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <ListItem button>
                        <ListItemIcon><School /></ListItemIcon>
                        <ListItemText primary="Courses" />
                    </ListItem>
                </NavLink>
                <NavLink to="/assignments" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <ListItem button>
                        <ListItemIcon><Assignment /></ListItemIcon>
                        <ListItemText primary="Assignments" />
                    </ListItem>
                </NavLink>
                <NavLink to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <ListItem button>
                        <ListItemIcon><AccountCircle /></ListItemIcon>
                        <ListItemText primary="Profile" />
                    </ListItem>
                </NavLink>
                <NavLink to="/logout" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <ListItem button>
                        <ListItemIcon><Logout /></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItem>
                </NavLink>
            </List>
        </div>
    );

    return (
        <div style={{ display: 'flex' }}>
            <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ display: { sm: 'none' } }}
            >
                <MenuIcon />
            </IconButton>
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </div>
    );
};

export default SideStudent;
