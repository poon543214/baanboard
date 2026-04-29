const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const nodemailer = require('nodemailer');
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

// --- 3. Cloudinary Setup ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'baanboard_posts',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage: storage });

// --- 3.5 Nodemailer Setup (สำหรับส่งอีเมล) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// --- 4. Schemas ---

// User Schema
const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    tel: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});
const User = mongoose.model('User', userSchema);

// Comment Schema
const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now }
});

// Post Schema
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    tag: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    comments: [commentSchema],
    created_at: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// Chat Schema (Contact us)
const chatMessageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['user', 'admin'], required: true },
    text: { type: String, required: true, trim: true },
    created_at: { type: Date, default: Date.now }
});
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

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

const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
    }
    next();
};

// --- 6. Routes: Authentication ---

app.post('/register', upload.single('profileImage'), async (req, res) => {
    try {
        const { fullname, email, tel, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            fullname,
            email,
            tel,
            password: hashedPassword,
            profileImage: req.file ? req.file.path : null,
            role: 'user'
        });

        res.status(201).json({ message: "Registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        // 1. รับค่า rememberMe เพิ่มจาก req.body (ส่งมาจากหน้า Frontend)
        const { email, password, rememberMe } = req.body; 
        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // 2. ตรวจสอบเงื่อนไข: ถ้า rememberMe เป็น true ให้ Token อยู่ได้ 7 วัน, ถ้าไม่ ให้อยู่แค่ 2 ชั่วโมง
        const expireTime = rememberMe ? '7d' : '2h';

        const token = jwt.sign(
            { id: user._id, role: user.role, fullname: user.fullname, email: user.email }, 
            SECRET_KEY, 
            { expiresIn: expireTime } // 3. นำตัวแปร expireTime มาใส่ตรงนี้
        );

        res.json({ 
            token, 
            id: user._id,
            fullname: user.fullname,
            role: user.role,
            profileImage: user.profileImage,
            email: user.email,
            tel: user.tel
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 ขอลิงก์รีเซ็ตรหัสผ่าน (ลืมรหัสผ่าน)
app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้นี้ในระบบ" });
        }

        // สร้าง Secret โดยเอารหัสผ่านเก่ามาผสม เพื่อให้ Token หมดอายุทันทีที่รหัสผ่านถูกเปลี่ยน
        const secret = SECRET_KEY + user.password;
        const token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '15m' });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${user._id}/${token}`;

        const mailOptions = {
            from: `"BaanBoard Support" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'รีเซ็ตรหัสผ่าน - BaanBoard',
            html: `
                <h2>รีเซ็ตรหัสผ่าน BaanBoard</h2>
                <p>คุณได้ทำการขอรีเซ็ตรหัสผ่าน กรุณากดลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์นี้มีอายุ 15 นาที)</p>
                <a href="${resetLink}" style="display:inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">ตั้งรหัสผ่านใหม่</a>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">หากคุณไม่ได้ทำรายการนี้ กรุณาเพิกเฉยต่ออีเมลฉบับนี้</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการส่งอีเมล" });
    }
});

// 📌 บันทึกรหัสผ่านใหม่
app.post('/reset-password/:id/:token', async (req, res) => {
    try {
        const { id, token } = req.params;
        const { newPassword } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
        }

        // ตรวจสอบ Token
        const secret = SECRET_KEY + user.password;
        try {
            jwt.verify(token, secret);
        } catch (error) {
            return res.status(400).json({ message: "ลิงก์หมดอายุหรือไม่ถูกต้อง" });
        }

        // เข้ารหัสผ่านใหม่แล้วบันทึก
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "เปลี่ยนรหัสผ่านสำเร็จแล้ว สามารถเข้าสู่ระบบใหม่ได้เลย" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
    }
});

// --- 7. Routes: Profile & User Data ---

// Get My Profile
app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit My Profile
app.put('/profile', authenticateToken, upload.single('profileImage'), async (req, res) => {
    try {
        const updates = {};
        const { fullname, tel, password } = req.body;
        if (fullname) updates.fullname = fullname;
        if (tel) updates.tel = tel;
        if (password) updates.password = await bcrypt.hash(password, 10);
        if (req.file && req.file.path) updates.profileImage = req.file.path;

        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 8. Routes: Posts (Main Features) ---

// 1. Create Post
app.post('/post', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { title, content, tag } = req.body;
        const image = req.file ? req.file.path : null;

        const newPost = await Post.create({
            title,
            content,
            tag,
            image, 
            owner: req.user.id
        });
        
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get All Posts
app.get('/post', authenticateToken, async (req, res) => {
    try {
        const { search, tag, order_by } = req.query;
        let query = {};

        if (search) query.title = { $regex: search, $options: 'i' };
        if (tag) query.tag = tag;

        let postsQuery = Post.find(query)
            .populate('owner', 'fullname role profileImage')
            .populate('comments.owner', 'fullname role profileImage');
        
        if (order_by === 'post_date') {
            postsQuery = postsQuery.sort({ created_at: -1 });
        } else {
            postsQuery = postsQuery.sort({ created_at: 1 });
        }

        const posts = await postsQuery.exec();
        res.json(posts.map(p => ({
            ...p.toObject(),
            likeCount: p.likes ? p.likes.length : 0
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Post by ID
app.get('/post/:id', authenticateToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('owner', 'fullname role profileImage')
            .populate('comments.owner', 'fullname role profileImage');
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json({
            ...post.toObject(),
            likeCount: post.likes ? post.likes.length : 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get My Posts
app.get('/mypost', authenticateToken, async (req, res) => {
    try {
        const posts = await Post.find({ owner: req.user.id }) 
            .populate('owner', 'fullname role profileImage')
            .populate('comments.owner', 'fullname role profileImage')
            .sort({ created_at: -1 });

        res.json(posts.map(post => ({
            ...post.toObject(),
            likeCount: post.likes ? post.likes.length : 0
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Get Liked Posts
app.get('/likedpost', authenticateToken, async (req, res) => {
    try {
        const posts = await Post.find({ likes: req.user.id }) 
            .populate('owner', 'fullname role profileImage')
            .populate('comments.owner', 'fullname role profileImage')
            .sort({ created_at: -1 });

        res.json(posts.map(post => ({
            ...post.toObject(),
            likeCount: post.likes ? post.likes.length : 0
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Get Commented Posts
app.get('/commentedpost', authenticateToken, async (req, res) => {
    try {
        const posts = await Post.find({ "comments.owner": req.user.id }) 
            .populate('owner', 'fullname role profileImage')
            .populate('comments.owner', 'fullname role profileImage')
            .sort({ created_at: -1 });

        res.json(posts.map(post => ({
            ...post.toObject(),
            likeCount: post.likes ? post.likes.length : 0
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Get Posts by User ID 
app.get('/user/:id/posts', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.id;
        const posts = await Post.find({ owner: userId })
            .populate('owner', 'fullname role profileImage')
            .populate('comments.owner', 'fullname role profileImage') 
            .sort({ created_at: -1 });

        res.json(posts.map(p => ({
            ...p.toObject(),
            likeCount: p.likes ? p.likes.length : 0,
            commentCount: p.comments ? p.comments.length : 0
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. Delete Post
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

// 9. Edit Post
app.put('/post/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Not found' });

        if (post.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const { title, content, tag } = req.body;
        if (title) post.title = title;
        if (content) post.content = content;
        if (tag) post.tag = tag;
        if (req.file && req.file.path) post.image = req.file.path;

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 9. Routes: Actions (Like & Comment) ---

// Like / Unlike
app.post('/post/:id/like', authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Not found' });

        const index = post.likes.findIndex(id => id.toString() === userId);
        
        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(index, 1);
        }
        
        await post.save();

        res.json({ likeCount: post.likes.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Comment
app.post('/post/:id/comment', authenticateToken, async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Not found' });

        post.comments.push({ text, owner: userId });
        await post.save();

        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 10. Routes: Contact Chat ---

app.get('/chat/messages', authenticateToken, async (req, res) => {
    try {
        const messages = await ChatMessage.find({ user: req.user.id }).sort({ created_at: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/chat/messages', authenticateToken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const message = await ChatMessage.create({
            user: req.user.id,
            senderRole: 'user',
            text: text.trim()
        });

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/chat/messages/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const messages = await ChatMessage.find()
            .populate('user', 'fullname email profileImage role')
            .sort({ created_at: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/chat/messages/:userId/reply', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { text } = req.body;
        const { userId } = req.params;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const message = await ChatMessage.create({
            user: userId,
            senderRole: 'admin',
            text: text.trim()
        });

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/health', async (req, res) => {
    try {
        const isConnected = mongoose.connection.readyState === 1;
        
        if (isConnected) {
            await mongoose.connection.db.admin().ping();
            return res.status(200).json({ 
                status: 'online', 
                database: 'ready' 
            });
        } else {
            throw new Error('Database not connected');
        }
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// --- Server Start ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));