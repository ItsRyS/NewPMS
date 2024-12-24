const db = require("../config/db");

exports.getApprovedProjects = async (req, res) => {
    try {
        const [projects] = await db.query(
            `
            SELECT 
                pr.project_id, 
                pr.project_name_th, 
                pr.project_name_eng, 
                pr.project_status, 
                pr.project_type, 
                pr.project_create_time, 
                pr.project_path, 
                pr.advisor_id, 
                ti.teacher_name AS project_advisor,
                GROUP_CONCAT(DISTINCT u.username) AS team_members
            FROM project_release pr
            LEFT JOIN teacher_info ti ON pr.advisor_id = ti.teacher_id
            LEFT JOIN students_projects sp ON pr.project_id = sp.request_id
            LEFT JOIN users u ON sp.student_id = u.user_id
            WHERE pr.project_status IN ('operate', 'success')
            GROUP BY pr.project_id
            ORDER BY pr.project_create_time DESC;
            `
        );

        if (projects.length === 0) {
            return res.status(404).json({ success: false, message: "No projects found." });
        }

        res.status(200).json({ success: true, data: projects });
    } catch (error) {
        console.error("Error fetching projects:", error.message);
        res.status(500).json({ success: false, error: "Failed to fetch projects." });
    }
};
