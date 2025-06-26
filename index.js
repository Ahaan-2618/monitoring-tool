const express = require("express");
const path = require("path"); // TODO - handle this
const { slowFunction } = require("./utils");
const promClient = require("prom-client");

const app = express();
const PORT = process.env.PORT || 3000;

// TODO - Add comments
const metricsCollector = promClient.collectDefaultMetrics;
metricsCollector({ register: promClient.register });

// TODO - Add proper comments

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static("public")); // Serve static files from public directory

// Basic routes
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Sample API routes
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

app.get("/api/metrics", async (req, res) => {
  try {
    res.setHeader("Content-type", promClient.register.contentType);
    const metrics = await promClient.register.metrics();
    return res.send(metrics);
  } catch (err) {
    return res.status(500).json({ status: "Error", Error: err.message });
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
  console.log(`✖️  Metrics API: http://localhost:${PORT}/api/metrics`);
});

module.exports = app;
