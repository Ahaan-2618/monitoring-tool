const express = require("express");
const path = require("path");
const { slowFunction } = require("./utils");
const promClient = require("prom-client");
const responseTime = require("response-time");

const app = express();
const PORT = process.env.PORT || 3000;

// Collect default metrics
const metricsCollector = promClient.collectDefaultMetrics;
metricsCollector({ register: promClient.register });

// Custom metrics for monitoring
const reqResTime = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10], // Seconds
});

const requestCounter = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Single responseTime middleware for both metrics
app.use(
  responseTime((req, res, time) => {
    const labels = {
      method: req.method,
      route: normalizeRoute(req.path),
      status_code: Math.floor(res.statusCode / 100) + "xx",
    };

    // Count requests
    requestCounter.labels(labels).inc();

    // Record duration (convert milliseconds to seconds)
    reqResTime.labels(labels).observe(time / 1000);
  })
);

// Function to normalize routes and reduce cardinality
function normalizeRoute(path) {
  return path
    .replace(/\/\d+/g, "/:id") // Replace numbers with :id
    .replace(/\/[a-f0-9-]{36}/g, "/:uuid") // Replace UUIDs
    .replace(/\/[a-f0-9]{24}/g, "/:objectid"); // Replace MongoDB ObjectIds
}

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Express Server!",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /",
      "GET /api/health",
      "GET /api/users",
      "GET /api/slowAPI",
      "GET /api/metrics",
      "POST /api/users",
    ],
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/users", (req, res) => {
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
  ];
  res.json(users);
});

app.post("/api/users", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      error: "Name and email are required",
    });
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    createdAt: new Date().toISOString(),
  };

  res.status(201).json({
    message: "User created successfully",
    user: newUser,
  });
});

app.get("/api/slowAPI", async (req, res) => {
  try {
    const result = await slowFunction();
    return res.json({
      status: "Success",
      message: `Heavy task is completed in ${result}ms`,
    });
  } catch (err) {
    return res.status(500).json({ status: "Error", Error: err.message });
  }
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  try {
    res.setHeader("Content-Type", promClient.register.contentType);
    const metrics = await promClient.register.metrics();
    res.send(metrics);
  } catch (err) {
    console.error("Error generating metrics:", err);
    res.status(500).json({ status: "Error", Error: err.message });
  }
});

// Keep the /api/metrics endpoint for backwards compatibility
app.get("/api/metrics", async (req, res) => {
  try {
    res.setHeader("Content-Type", promClient.register.contentType);
    const metrics = await promClient.register.metrics();
    res.send(metrics);
  } catch (err) {
    console.error("Error generating metrics:", err);
    res.status(500).json({ status: "Error", Error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`🦥 Slow API: http://localhost:${PORT}/api/slowAPI`);
  console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
});

module.exports = app;
