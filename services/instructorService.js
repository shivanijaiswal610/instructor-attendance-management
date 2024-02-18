const db = require("../database");
const { formatTime, sumWorkingHours } = require("../helper");

const recordCheckInTime = (instructorId, checkinTime) => {
  return new Promise((resolve, reject) => {
    const formattedCheckinTime = formatTime(checkinTime);

    const selectInstructorQuery =
      "SELECT * FROM instructors WHERE instructor_id = ?";

    db.query(selectInstructorQuery, [instructorId], (err, instructors) => {
      if (err) {
        reject({
          success: false,
          message: err?.sqlMessage || "Internal Server Error",
        });
        return;
      }

      if (instructors.length > 0) {
        const selectMaxCheckoutTimeQuery =
          "SELECT MAX(checkout_time) AS max_checkout_time FROM instructors WHERE instructor_id = ?";

        db.query(
          selectMaxCheckoutTimeQuery,
          [instructorId],
          (err, checkoutTimes) => {
            if (err) {
              reject({
                success: false,
                message: err?.sqlMessage || "Internal Server Error",
              });
              return;
            }

            const lastCheckoutTime = checkoutTimes[0]["max_checkout_time"];

            if (checkinTime <= lastCheckoutTime) {
              reject({
                success: false,
                message: `You cannot check-in before your last check-out time. Your last check-out was: ${lastCheckoutTime}`,
              });
            } else {
              const selectMaxCheckinTimeQuery =
                "SELECT MAX(checkin_time) AS max_checkin_time FROM instructors WHERE instructor_id = ?";

              db.query(
                selectMaxCheckinTimeQuery,
                [instructorId],
                (err, checkinTimes) => {
                  if (err) {
                    reject({
                      success: false,
                      message: err?.sqlMessage || "Internal Server Error",
                    });
                    return;
                  }

                  const lastCheckinTime = checkinTimes[0]["max_checkin_time"];

                  if (!lastCheckinTime) {
                    reject({
                      success: false,
                      message: `There is no previous check-in record. You cannot check-in.`,
                    });
                  } else {
                    const selectCheckoutTimeQuery =
                      "SELECT checkout_time FROM instructors WHERE checkin_time = ?";

                    db.query(
                      selectCheckoutTimeQuery,
                      [lastCheckinTime],
                      (err, checkoutDetails) => {
                        if (err) {
                          reject({
                            success: false,
                            message: err?.sqlMessage || "Internal Server Error",
                          });
                          return;
                        }

                        const lastCheckoutTime =
                          checkoutDetails[0].checkout_time;

                        if (!lastCheckoutTime) {
                          reject({
                            success: false,
                            message: `Unable to check-in: No previous check-out record found.`,
                          });
                        } else {
                          const insertCheckinSql =
                            "INSERT INTO instructors (instructor_id, checkin_time) VALUES (?, ?)";

                          db.query(
                            insertCheckinSql,
                            [instructorId, formattedCheckinTime],
                            (err) => {
                              if (err) {
                                reject({
                                  success: false,
                                  message:
                                    err?.sqlMessage || "Internal Server Error",
                                });
                                return;
                              }
                              return resolve({
                                success: true,
                                message: `Check-in time recorded successfully.`,
                              });
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      } else {
        const insertCheckinSql =
          "INSERT INTO instructors (instructor_id, checkin_time) VALUES (?, ?)";

        db.query(
          insertCheckinSql,
          [instructorId, formattedCheckinTime],
          (err) => {
            if (err) {
              reject({
                success: false,
                message: err?.sqlMessage || "Internal Server Error",
              });
              return;
            }
            return resolve({
              success: true,
              message: `Check-in time recorded successfully.`,
            });
          }
        );
      }
    });
  });
};

const recordCheckOutTime = (instructorId, checkOutTime) => {
  return new Promise((resolve, reject) => {
    const formattedCheckOutTime = formatTime(checkOutTime);

    const checkInstructorExistsQuery =
      "SELECT COUNT(*) AS count FROM instructors WHERE instructor_id = ? AND checkin_time IS NOT NULL";
    db.query(
      checkInstructorExistsQuery,
      [instructorId],
      (checkErr, checkResult) => {
        if (checkErr) {
          reject({
            success: false,
            message: checkErr?.sqlMessage || "Internal Server Error",
          });
          return;
        }

        if (checkResult[0].count > 0) {
          const selectMaxCheckinTimeQuery =
            "SELECT MAX(checkin_time) AS max_checkin_time FROM instructors WHERE instructor_id = ?";

          db.query(
            selectMaxCheckinTimeQuery,
            [instructorId],
            (err, checkinTimes) => {
              if (err) {
                reject({
                  success: false,
                  message: err?.sqlMessage || "Internal Server Error",
                });
                return;
              }

              const lastCheckinTime = checkinTimes[0]["max_checkin_time"];

              if (!lastCheckinTime) {
                reject({
                  success: false,
                  message: `There is no previous check-in record.. You cannot check-out.`,
                });
              } else {
                const selectCheckoutTimeQuery =
                  "SELECT checkout_time FROM instructors WHERE checkin_time = ?";

                db.query(
                  selectCheckoutTimeQuery,
                  [lastCheckinTime],
                  (err, checkoutDetails) => {
                    if (err) {
                      reject({
                        success: false,
                        message: err?.sqlMessage || "Internal Server Error",
                      });
                      return;
                    }

                    const lastCheckoutTime = checkoutDetails[0].checkout_time;

                    if (lastCheckoutTime) {
                      reject({
                        success: false,
                        message: `You have already checked out for the day.`,
                      });
                    } else {
                      const updateCheckOutTimeQuery =
                        "UPDATE instructors SET checkout_time = ? WHERE instructor_id = ?";
                      db.query(
                        updateCheckOutTimeQuery,
                        [formattedCheckOutTime, instructorId],
                        (updateErr) => {
                          if (updateErr) {
                            reject({
                              success: false,
                              message:
                                updateErr?.sqlMessage ||
                                "Internal Server Error",
                            });
                            return;
                          }
                          return resolve({
                            success: true,
                            message: `Check-out time recorded successfully.`,
                          });
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        } else {
          reject({
            success: false,
            message: `Cannot record check-out time. without a valid check-in time`,
          });
        }
      }
    );
  });
};

const getMonthlyReport = (month, year) => {
  return new Promise((resolve, reject) => {
    const query = `
          SELECT instructor_id, 
                 GROUP_CONCAT(checkin_time) AS checked_in_time,
                 GROUP_CONCAT(working_hrs) AS working_hrs 
          FROM instructors 
          WHERE MONTH(checkin_time) = ? AND YEAR(checkin_time) = ? 
          GROUP BY instructor_id;
      `;
    db.query(query, [month, year], (err, report) => {
      if (err) {
        return reject({
          success: false,
          message: err?.sqlMessage || "Internal Server Error",
        });
      }
      const finalReport = report.map((rpDetail) => {
        rpDetail.working_hrs = sumWorkingHours(rpDetail.working_hrs);
        rpDetail.checked_in_time = rpDetail.checked_in_time.split(",");
        return rpDetail;
      });
      return resolve({ success: true, report: finalReport });
    });
  });
};

module.exports = {
  recordCheckInTime,
  recordCheckOutTime,
  getMonthlyReport,
};
