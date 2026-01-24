const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const { sendOtpEmail } = require('../utils/email');

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await db.query(
      `INSERT INTO users (name, email, password_hash, role_id, otp, otp_expires_at)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [name, email, hashedPassword, role_id, otp, otpExpiry]
    );

    await sendOtpEmail(email, otp);

    res.status(201).json({
      message: 'OTP sent to email',
      email,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup failed' });
  }
};

// exports.signup = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     // For signup, we usually collect a 'name' too. I'll use a part of email as name for now.
//     const name = email.split('@')[0];

//     // Check if user exists
//     const userCheck = await db.query("SELECT * FROM users WHERE email = $1", [email]);
//     if (userCheck.rows.length > 0) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
    
//     // Insert new user into the USER'S table schema
//     const result = await db.query(
//       "INSERT INTO users (name, email, password_hash, role_id, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name",
//       [name, email, hashedPassword, 1, true]
//     );
//     const newUser = result.rows[0];

//     const token = jwt.sign(
//       { id: newUser.id, email: newUser.email }, 
//       process.env.JWT_SECRET || "your_jwt_secret", 
//       { expiresIn: "1h" }
//     );

//     res.status(201).json({ 
//       message: "User created successfully",
//       token,
//       email: newUser.email
//     });
//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({ message: "Server error during signup", error: error.message });
//   }
// };

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    // Find user in DB using the specific schema
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
        console.log(`User not found: ${email}`);
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Checking if account is active (as per the schema)
    if (user.is_active === false) {
        return res.status(403).json({ message: "Account is inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`Password match for ${email}: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_id }, 
      process.env.JWT_SECRET || "your_jwt_secret", 
      { expiresIn: "1h" }
    );
    
    // Update last_login
    await db.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);
    
    res.json({ token, email: user.email, role: user.role_id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await db.query(
      `SELECT * FROM users WHERE email=$1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    if (user.otp !== otp || new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await db.query(
      `UPDATE users SET is_verified=true, otp=NULL, otp_expires_at=NULL WHERE email=$1`,
      [email]
    );

    const token = jwt.sign(
      { id: user.id, role: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      role: user.role_id,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'OTP verification failed' });
  }
};

