const bcrypt = require("bcrypt");
const newPassword = ""; // กำหนดรหัสผ่านใหม่
const saltRounds = 10; // ค่า salt

bcrypt.hash(newPassword, saltRounds, function (err, hash) {
  if (err) {
    console.error("Error hashing password:", err);
  } else {
    console.log("🔑 Hashed Password:", hash);
  }
});
