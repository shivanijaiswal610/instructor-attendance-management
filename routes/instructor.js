const express = require("express");
const router = express.Router();
const {
  recordCheckInTime,
  recordCheckOutTime,
  getMonthlyReport,
} = require("../controllers/instructorController");


router.post("/checkin/:instructorId", recordCheckInTime);

router.post("/checkout/:instructorId", recordCheckOutTime);

router.get("/getMonthlyReport", getMonthlyReport);

module.exports = router;
