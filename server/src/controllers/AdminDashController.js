const db = require("../config/db");

// ดึงข้อมูลสำหรับ Admin Dashboard
const getAdminDashboardData = async (req, res) => {
  try {
    // นับจำนวนโครงการที่กำลังดำเนินการ
    const [activeProjects] = await db.query(
      "SELECT COUNT(*) AS total FROM project_release WHERE project_status = 'operate'"
    );

    // นับจำนวนคำร้องขออนุมัติโครงการที่รอการอนุมัติ
    const [pendingProjectRequests] = await db.query(
      "SELECT COUNT(*) AS total FROM project_requests WHERE status = 'pending'"
    );

    // นับจำนวนเอกสารที่รอการอนุมัติ
    const [pendingDocuments] = await db.query(
      "SELECT COUNT(*) AS total FROM project_documents WHERE status = 'pending'"
    );

    // การกระจายประเภทโครงการ (Pie Chart)
    const [projectTypeDistribution] = await db.query(
      "SELECT project_type, COUNT(*) AS total FROM project_release GROUP BY project_type"
    );

    // หมวดหมู่โครงการที่นิยมที่สุด
    const [popularProjectCategories] = await db.query(
      "SELECT project_type, COUNT(*) AS total FROM project_release GROUP BY project_type ORDER BY total DESC LIMIT 5"
    );

    // แนวโน้มประเภทโครงการตามเวลา
    const [projectTrends] = await db.query(
      "SELECT YEAR(project_create_time) AS year, project_type, COUNT(*) AS total FROM project_release GROUP BY year, project_type ORDER BY year DESC"
    );

    res.status(200).json({
      activeProjects: activeProjects[0].total,
      pendingProjectRequests: pendingProjectRequests[0].total,
      pendingDocuments: pendingDocuments[0].total,
      projectTypeDistribution,
      popularProjectCategories,
      projectTrends,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};

module.exports = { getAdminDashboardData };
