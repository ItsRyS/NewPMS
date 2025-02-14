const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// ตั้งค่า Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const BUCKET_NAME = process.env.SUPABASE_BUCKET;

// ฟังก์ชันอัปโหลดไฟล์ไปยัง Supabase
const uploadFileToSupabase = async (file, folder) => {
  const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;

  const {error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(`${folder}/${fileName}`, file.buffer, { contentType: file.mimetype });

  if (error) throw new Error(`❌ Upload error: ${error.message}`);

  // คืนค่า URL ของไฟล์
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${folder}/${fileName}`;
};

module.exports = { supabase, uploadFileToSupabase };
