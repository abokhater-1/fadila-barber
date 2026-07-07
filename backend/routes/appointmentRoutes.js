const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getAvailableSlots,
  getAllAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment
} = require("../controllers/appointmentController");

router.post("/", createAppointment);
router.get("/available/:date", getAvailableSlots);

router.get("/", getAllAppointments);
router.get("/:id", getAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

module.exports = router;