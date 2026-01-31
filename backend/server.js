const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // เพิ่ม multer
const cloudinary = require('cloudinary').v2; // เพิ่ม Cloudinary
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // ตัวเชื่อม
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;

// --- 1. Middleware ---
app.use(cors());
app.use(express.json());

// --- 2. Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('DB Error:', err));

// --- 3. Cloudinary Setup 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'baanboard_posts', // ชื่อโฟลเดอร์ใน Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage: storage });

// --- 4. Schemas ---
const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true }, // ชื่อ-นามสกุล
    email: { type: String, required: true, unique: true }, // ใช้ Email เป็น ID หลักแทน Username
    tel: { type: String, required: true }, // เบอร์โทร
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});
const User = mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String }, // เก็บ URL รูป
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// --- 5. Auth Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No Token" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid Token" });
        req.user = user;
        next();
    });
};

// --- 6. Routes (Auth) ---
app.post('/register', async (req, res) => {
    try {
        // รับค่าให้ครบตามหน้าเว็บ (Full name, Email, Tel, Password)
        const { fullname, email, tel, password } = req.body;

        // เช็คว่าอีเมลซ้ำไหม (แทนเช็ค username)
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        // สร้าง User ใหม่
        await User.create({
            fullname,
            email,
            tel,
            password: hashedPassword,
            role: 'user'
        });

        res.status(201).json({ message: "Registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- แก้ไข Route Login (ต้อง Login ด้วย Email) ---
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body; // รับ Email แทน Username
        
        // ค้นหาจาก Email
        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // ใน Token ใส่ fullname ไปด้วย เผื่อเอาไปโชว์มุมขวาบน
        const token = jwt.sign(
            { id: user._id, role: user.role, fullname: user.fullname }, 
            SECRET_KEY, 
            { expiresIn: '2h' }
        );

        res.json({ token, role: user.role, fullname: user.fullname });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 7. Routes (Posts) ---

// Get Posts (ดูได้ทุกคน ไม่ต้อง Login)
app.get('/getpost', async (req, res) => {
    try {
        const { search, order_by } = req.query;
        let query = {};
        if (search) query.title = { $regex: search, $options: 'i' };

        let posts = Post.find(query).populate('owner', 'fullname role');
        
        if (order_by === 'post_date') {
            posts = posts.sort({ created_at: -1 });
        } else {
            posts = posts.sort({ created_at: 1 });
        }

        res.json(await posts.exec());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Post (ต้อง Login + อัปรูปได้)
// upload.single('image') คือตัวรับไฟล์จาก Frontend
app.post('/post', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        
        // ถ้าอัปรูปสำเร็จ req.file.path จะเป็นลิงก์ URL จาก Cloudinary
        const image = req.file ? req.file.path : null;

        const newPost = await Post.create({
            title,
            content,
            image, 
            owner: req.user.id
        });
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Post
app.delete('/deletepost/:id', authenticateToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Not found" });
        
        if (post.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));