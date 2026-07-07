const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // פרטי לקוח
  customerName: {
    type: String,
    required: [true, 'שם הלקוח הוא שדה חובה'],
    trim: true,
    minlength: [2, 'שם חייב להכיל לפחות 2 תווים'],
    maxlength: [50, 'שם ארוך מדי']
  },
  
  customerPhone: {
    type: String,
    required: [true, 'מספר טלפון הוא שדה חובה'],
    match: [/^05\d{8}$/, 'מספר טלפון לא תקין (05XXXXXXXX)']
  },
  
  // פרטי התור
  service: {
    type: String,
    required: [true, 'יש לבחור סוג שירות'],
  },
  
  date: {
    type: Date,
    required: [true, 'תאריך התור הוא שדה חובה']
  },
  
  duration: {
  type: Number,
  required: true
},
  time: {
    type: String,
    required: [true, 'שעת התור היא שדה חובה'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'פורמט שעה לא תקין']
  },
  
  // סטטוסים
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'confirmed'
  },
  
  // דגלים למיילים
  newAppointmentEmailSent: {
    type: Boolean,
    default: false
  },
  
  upcomingEmailSent: {
    type: Boolean,
    default: false
  },
  
  // הערות
  notes: {
    type: String,
    maxlength: [500, 'הערות מוגבלות ל-500 תווים']
  }
  
}, {
  timestamps: true // מוסיף createdAt ו-updatedAt אוטומטית
});

// אינדקס לחיפוש מהיר
appointmentSchema.index({ date: 1, time: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ customerPhone: 1 });

// מתודה סטטית למציאת תורים לתאריך מסוים
appointmentSchema.statics.findByDate = function(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return this.find({
    date: { $gte: start, $lte: end },
    status: { $ne: 'cancelled' }
  }).sort({ time: 1 });
};

// מתודה סטטית לבדיקת תורים מתקרבים
appointmentSchema.statics.findUpcoming = function(minutes = 60) {
  const now = new Date();
  const future = new Date(now.getTime() + minutes * 60000);
  
  return this.find({
    date: { $gte: now, $lte: future },
    status: 'confirmed',
    upcomingEmailSent: false
  }).sort({ date: 1, time: 1 });
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;