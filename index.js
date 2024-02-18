require("./database");
require("dotenv/config");
const instructorRoutes = require("./routes/instructor");
const express = require("express");
const bodyparser = require("body-parser");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);
app.use(bodyparser.json());

app.use("/api", instructorRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
