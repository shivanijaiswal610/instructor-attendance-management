const moment = require("moment");
require("moment-duration-format");
function sumWorkingHours(workingHoursString) {
  const workingHoursArray = workingHoursString.split(",");

  let totalWorkingHours = moment.duration();

  workingHoursArray.forEach((workingHour) => {
    const duration = moment.duration(workingHour);

    totalWorkingHours.add(duration);
  });

  return totalWorkingHours.format("hh:mm:ss", { trim: false });
}

const formatTime = (time) => {
  const formattedTime = new Date(time)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  return formattedTime;
};

module.exports = {
  sumWorkingHours,
  formatTime,
};
