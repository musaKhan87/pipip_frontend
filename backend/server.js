// const dotenv = require("dotenv");
// const express = require("express");
// const cors = require("cors");

// dotenv.config();
// const connectDB = require("./config/db");
// const areaRoutes = require("./routes/areaRoutes"); 


// connectDB();

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use("/api/rentals", require("./routes/rentalRoutes"));
// app.use("/api/bikes", require("./routes/bikeRoutes"));

// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).json({
//     message: err.message || "Server error",
//   });
// });



// app.use("/api/areas", areaRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);


// });

// 🔥 ENV MUST BE LOADED FIRST
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const http = require("http"); // 👈 NEW: Required to attach Socket.io to Express
const { Server } = require("socket.io"); // 👈 NEW: Socket.io Server import
const connectDB = require("./config/db");
const areaRoutes = require("./routes/areaRoutes");
const bikeRoutes = require("./routes/bikeRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes"); // 👈 NEW: Notification routes import
// Connect to MongoDB
connectDB();


const app = express();

// Trust reverse proxy (Render / Cloudflare) to ensure accurate client IP detection
app.set("trust proxy", 1);

const server = http.createServer(app); // 👈 NEW: Wrap Express app in HTTP server

// Initialize Socket.io with your exact CORS rules
// const io = new Server(server, {
//   cors: {
//     origin: ["https://www.pipip.in"],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//   },
// });

const io = new Server(server, {
  cors: {
    origin: [
      "https://www.pipip.in",   // 👈 Fixed: Added without trailing slash
      "https://www.pipip.in/",  // Keeps the existing one safe
      "http://localhost:5173",  // Recommended: Add local frontend port if you develop locally
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  },
});

// Pass the active io instance context globally so controllers can use it via req.app.get("io")
app.set("io", io);


// Middlewares
app.use(compression());

// Strict CORS Whitelist
const allowedOrigins = [
  "https://www.pipip.in",
  "https://pipip.in",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, "");
    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith(".pipip.in") ||
      cleanOrigin.startsWith("http://localhost:")
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-area-id",
    "x-client-signature",
  ],
};
app.use(cors(corsOptions));

// Global Rate Limiter: 200 requests per minute per IP
const rateLimit = require("express-rate-limit");
const globalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    return (
      req.headers["cf-connecting-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.ip ||
      "127.0.0.1"
    );
  },
  message: { message: "Too many requests from this IP, please try again in a minute." },
});
app.use("/api", globalApiLimiter);

// Secret Client Handshake Middleware (Blocks Postman & Unofficial Clients)
const verifyClient = require("./middleware/verifyClient");
app.use("/api", verifyClient);

app.use('/api/payment/webhook', express.raw({ type: 'application/json', limit: '1mb' }));

app.use(express.json({ limit: "25kb" }));
app.use(express.urlencoded({ extended: true, limit: "25kb" }));

// Catch invalid/malformed JSON syntax errors early before reaching route handlers
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Malformed JSON payload in request body" });
  }
  next(err);
});

app.use(
  "/api/payment",
  paymentRoutes
);



// Routes
app.use("/api/areas", areaRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/customers", require("./routes/CustomerRoutes"));
app.use("/api/bookings", require("./routes/BookingRoutes"));
app.use("/api/availability", require("./routes/AvailabilityRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/notifications", notificationRoutes); // 👈 NEW: Notification routes mounted
app.use("/api/clusters", require("./routes/ClusterRoutes"));

app.use("/api/expenses", require("./routes/ExpenseRoute"));
app.use("/api/daily-accounts", require("./routes/DailyAccountRoutes"));
app.use("/api/daily-reports", require("./routes/dailyReportRoutes"));
app.use("/api/vehicle-services", require("./routes/VehicleServiceHistoryRoutes"));

// 5. Socket.io Connection Monitoring Log
io.on("connection", (socket) => {
  console.log(`🔌 Admin dashboard socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ Admin dashboard socket disconnected: ${socket.id}`);
  });
});

// Global error handler (IMPORTANT)
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({
    message: err.message || "Server error",
  });
});

// Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server and Socket.io running on port ${PORT}`);
  // Start daily report cron automation
  const { initDailyReportScheduler } = require("./controllers/dailyReportController");
  initDailyReportScheduler();
});