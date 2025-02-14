const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// ✅ โหลดค่าจาก .env ให้ถูกต้อง
const supabaseUrl = process.env.PROD_SUPABASE_URL;
const supabaseKey = process.env.PROD_SUPABASE_KEY;
const BUCKET_NAME = process.env.SUPABASE_BUCKET;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("⚠️ Supabase URL or Key is missing from environment variables.");
}

// ✅ ตั้งค่า Supabase Client
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ ฟังก์ชันอัปโหลดไฟล์ไปยัง Supabase
const uploadFileToSupabase = async (file, folder) => {
  const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(`${folder}/${fileName}`, file.buffer, { contentType: file.mimetype });

  if (error) throw new Error(`❌ Upload error: ${error.message}`);

  // ✅ คืนค่า URL ของไฟล์ที่อัปโหลดแล้ว
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${folder}/${fileName}`;
};

module.exports = { supabase, uploadFileToSupabase };
