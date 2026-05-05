# Deployment Document

## 1. Application Overview
This app provides a Flask API with basic item creation/listing and a health endpoint, plus a simple frontend page.

### API Endpoints
| Method | URL | Description | Example Response |
|---|---|---|---|
| GET | /health | Health check | {"status":"ok"} |
| GET | /api/time | Server UTC time | {"server_time_utc":"..."} |
| GET | /api/items | List created items | {"count":1,"items":[...]} |
| POST | /api/items | Create new item | {"id":1,"name":"Demo"} |

## 2. Architecture Diagram
```text
Browser
  |
  v
AWS EC2 (Ubuntu 22.04)
  |
  v
Docker Container
  |
  v
Flask App (port 5000)
```

## 3. Tools and Technologies
| Tool | Why Used |
|---|---|
| Linux | EC2 server environment |
| Python | Backend language |
| Flask | API framework |
| flask-cors | CORS support for frontend requests |
| Git/GitHub | Version control and collaboration |
| Docker | Containerized deployment |
| GitHub Actions | Automated testing and Docker build |
| AWS EC2 | Cloud hosting |

## 4. Local Setup Instructions
1. Clone the repository.
2. Install Python dependencies.
3. Run the app with `python app.py`.
4. Test health with `curl http://localhost:5000/health`.
5. Optionally run Docker build and container.

## 5. CI/CD Pipeline Explanation
The workflow triggers on each push to `main`. The `test` job installs dependencies and runs pytest. If tests pass, `build-docker` builds the image, runs a container, and verifies `/health`.

## 6. Deployment Steps
1. Launch EC2 `t2.micro` Ubuntu 22.04.
2. Open ports 22 and 5000 in security group.
3. SSH into EC2 and install Docker.
4. Clone repository.
5. Build image and run container with `--restart=always`.

## 7. Testing Evidence
Add screenshots/curl outputs here:
- `pytest` passing
- GitHub Actions green
- EC2 public IP `/health` response

## 8. Challenges and Solutions
1. Placeholder: describe first real issue and fix.
2. Placeholder: describe second real issue and fix.

## 9. Lessons Learned
1. CI catches issues early.
2. Containerization reduces environment mismatch.
3. Cloud networking/security groups are critical.
