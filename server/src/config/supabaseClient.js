const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials are missing');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ตรวจสอบการเชื่อมต่อเมื่อเริ่มต้น
const checkConnection = async () => {
  try {
    const {error } = await supabase.storage.getBucket('upload');
    if (error) throw error;
    console.log('Successfully connected to Supabase storage');
  } catch (error) {
    console.error('Supabase connection error:', error);
  }
};

checkConnection();

module.exports = supabase;