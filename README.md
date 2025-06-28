🚀 Monitoring Tool with Prometheus, Grafana & Loki
A production-ready observability setup that demonstrates how to monitor and visualize backend service metrics and logs using Prometheus, Grafana, and Loki. This project collects and displays custom application metrics and logs, giving you real-time insights into system health and behavior.

🛠️ Tech Stack
Node.js – Simulated backend service

Prometheus – Metrics collection and scraping

Grafana – Dashboard for data visualization

Loki – Log aggregation and querying

Docker Compose – For container orchestration

📸 ** Screenshots ** 

📊 Grafana metrics dashboard

🪵 Loki logs query interface

![image](https://github.com/user-attachments/assets/10a3447a-afce-44ed-b370-0c4574bb05e2)


🔧 Prometheus targets/status

⚙️ Features
Real-time collection of custom metrics

Visual dashboards for request rates, errors, and latency

Centralized logging with searchable queries

Dockerized setup – easy to spin up and run

📦 Setup Instructions
bash
Copy
Edit
# Clone the repo
git clone https://github.com/Ahaan-2618/monitoring-tool.git
cd monitoring-tool

# Start everything
docker-compose up --build
Visit:

Prometheus: http://localhost:9090

Grafana: http://localhost:3000 (default login: admin/admin)

Loki: http://localhost:3100

📈 Metrics Tracked
HTTP request count

Response duration (histogram)

Error rate

Log messages from service

🔍 Why This Project?
This project was built to better understand observability patterns in backend systems, and how DevOps tools work together to track system health and debug issues in real time.

💡 Future Improvements
Add Alertmanager integration for email/Slack alerts

Integrate Tempo for tracing

Deploy to Kubernetes

Push logs to Loki from multiple microservices

🤝 Contributing
Feel free to open issues or PRs if you'd like to improve or expand this project!

📄 License
MIT
