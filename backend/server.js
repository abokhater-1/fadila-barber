require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const settingsRoutes = require('./routes/settingsRoutes'); 

const adminController = require('./controllers/adminController');
const cronService = require('./services/cronService');
const BusinessSettings = require('./models/BusinessSettings'); 

const app = express();

/* ========================
   MIDDLEWARE
======================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleString('he-IL')} - ${req.method} ${req.url}`);
  next();
});

/* ========================
   ROUTES
======================== */
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingsRoutes); 

/* ========================
   HEALTH CHECK
======================== */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Fadila Barber API is running',
    timestamp: new Date().toISOString()
  });
});

/* ========================
   ERROR HANDLING
======================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

/* ========================
   DEFAULT SETTINGS CREATION
======================== */
async function ensureSettings() {
  try {
    const exists = await BusinessSettings.findOne();
    if (!exists) {
      await BusinessSettings.create({
        workingHours: {
          sunday:    { start:"09:00", end:"19:00", breaks:[], enabled:true },
          monday:    { start:"09:00", end:"19:00", breaks:[], enabled:true },
          tuesday:   { start:"09:00", end:"19:00", breaks:[], enabled:true },
          wednesday: { start:"09:00", end:"19:00", breaks:[], enabled:true },
          thursday:  { start:"09:00", end:"19:00", breaks:[], enabled:true },
          friday:    { start:"09:00", end:"14:00", breaks:[], enabled:true },
          saturday:  { start:"09:00", end:"14:00", breaks:[], enabled:true }
        }
      });
      console.log("✅ Default business settings created");
    }
  } catch (err) {
    console.error("❌ Error in ensureSettings:", err);
  }
}

/* ========================
   INITIALIZATION & START SERVER
======================== */
// استدعاء الاتصال بقاعدة البيانات مباشرة ليتم حفظ الاتصال وتجاوب السيرفر بسرعة
connectDB()
  .then(async () => {
    await ensureSettings();
    await adminController.createAdmin();
    
    // ملاحظة: الـ Cron لن يعمل بشكل مستمر على Vercel، ولكن نتركه هنا للتشغيل المحلي (Local)
    if (process.env.NODE_ENV !== 'production') {
      cronService.start();
    }
  })
  .catch((err) => {
    console.error('❌ Failed to connect to DB during initialization:', err);
  });

// تشغيل الـ listen فقط إذا كنا نعمل محلياً (Local Development)
// Vercel يتكفل بتشغيل الـ app تلقائياً دون الحاجة لأمر listen ثابت
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`\n💈 Fadila Barber Server Running on port ${PORT}`);
  });
}

/* ========================
   GRACEFUL SHUTDOWN
======================== */
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  if (process.env.NODE_ENV !== 'production') cronService.stop();
  process.exit(0);
});

module.exports = app;
