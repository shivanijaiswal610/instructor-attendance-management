const instructorService = require("../services/instructorService");

const recordCheckInTime = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const checkinTime = new Date();
    const resp = await instructorService.recordCheckInTime(
      instructorId,
      checkinTime
    );
    if (resp && resp?.success) {
      res.status(200).json(resp);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error?.message || "Internal Server Error",
    });
  }
};

const recordCheckOutTime = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const checkOutTime = new Date();
    const resp = await instructorService.recordCheckOutTime(
      instructorId,
      checkOutTime
    );
    if (resp && resp?.success) {
      res.status(200).json(resp);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error?.message || "Internal Server Error",
    });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const resp = await instructorService.getMonthlyReport(month, year);
    if (resp && resp?.success) {
      res.status(200).json(resp);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error?.message || "Internal Server Error",
    });
  }
};

module.exports = {
  recordCheckInTime,
  recordCheckOutTime,
  getMonthlyReport
};
