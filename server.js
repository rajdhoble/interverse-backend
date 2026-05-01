require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const internshipRoutes = require("./routes/internships");
const applicationRoutes = require("./routes/applications");
const aiRoutes = require("./routes/ai");

const app = express();

/* FIXED CORS */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://internship-portal-frontend-six.vercel.app"
    ],
    credentials: true
  })
);

app.use(express.json());

app.get("/healthcheck", (req, res) => res.send("Healthy"));

app.use("/api/auth", authRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/faq", aiRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));