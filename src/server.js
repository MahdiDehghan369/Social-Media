const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const projectMode = process.env.PROJECT_MODE == "production";
if (!projectMode) {
  dotenv.config();
}

async function dbConnect() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`DB Connected -> ${mongoose.connection.host}`);
  } catch (error) {
    console.error("DB Connection error -> ", error);
  }
}

function startServer() {
  app.listen(process.env.PORT, () => {
    console.log(
      `Server is running in ${
        !projectMode ? "development" : "production"
      } mode on port ${process.env.PORT}`
    );
  });
}

function run() {
  startServer();
  dbConnect()
}

run();
