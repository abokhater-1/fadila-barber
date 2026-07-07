const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

/* ===============================
   מייל תור חדש
=================================*/

async function sendNewAppointmentEmail(appointment) {
  try {

    await transporter.sendMail({
      from: `"Fadila Barber System" <${process.env.EMAIL_USER}>`,
      to: process.env.BUSINESS_OWNER_EMAIL,
      subject: "📅 תור חדש נקבע!",
      html: `
        <div dir="rtl" style="font-family:Arial">
          <h2>תור חדש נקבע ✅</h2>

          <p><b>שם לקוח:</b> ${appointment.customerName}</p>
          <p><b>טלפון:</b> ${appointment.customerPhone}</p>
          <p><b>שירות:</b> ${appointment.service}</p>
          <p><b>תאריך:</b> ${new Date(appointment.date).toLocaleDateString("he-IL")}</p>
          <p><b>שעה:</b> ${appointment.time}</p>
        </div>
      `
    });

    console.log("✅ New appointment email sent");

    return { success: true };

  } catch (error) {
    console.error("❌ Email error:", error.message);
    return { success: false };
  }
}

/* ===============================
   מייל כשל וואטסאפ
=================================*/

async function sendWhatsAppFailureEmail(data) {
  try {

    await transporter.sendMail({
      from: `"Fadila Barber System" <${process.env.EMAIL_USER}>`,
      to: `${process.env.BUSINESS_OWNER_EMAIL}, ${process.env.ADMIN_ALERT_EMAIL}`,
      subject: "⚠️ כשל בשליחת WhatsApp",
      html: `
        <div dir="rtl" style="font-family:Arial">
          <h2>נכשל שליחת וואטסאפ</h2>

          <p><b>טלפון:</b> ${data.phone}</p>

          <p><b>תוכן ההודעה:</b></p>
          <pre>${data.message}</pre>

          <hr>
          <p><b>שגיאה:</b> ${data.error}</p>
        </div>
      `
    });

    console.log("✅ WhatsApp failure email sent");

  } catch (error) {
    console.error("❌ Failed to send failure email:", error.message);
  }
}

module.exports = {
  sendNewAppointmentEmail,
  sendWhatsAppFailureEmail
};