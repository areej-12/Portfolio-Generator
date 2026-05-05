# Deployment Document

## 1. Application Overview
This project is a containerized Flask-based backend with a simple frontend page for creating and viewing items. It demonstrates complete DevOps flow: local development, testing, Docker image build, CI validation in GitHub Actions, and cloud deployment to AWS EC2.

The application solves a common beginner deployment problem: how to expose a frontend and API from one containerized service in a cloud VM using repeatable steps.

### API Endpoints
| Method | URL | Description | Example Response |
|---|---|---|---|
| GET | `/health` | Health check endpoint used by CI and deployment verification | `{"status":"ok"}` |
| GET | `/api/time` | Returns current server UTC timestamp | `{"server_time_utc":"2026-05-05T16:30:00+00:00"}` |
| GET | `/api/items` | Lists created items and total count | `{"count":1,"items":[{"id":1,"name":"Portfolio Project"}]}` |
| POST | `/api/items` | Creates an item from JSON body (`{"name":"..."}`) | `{"id":2,"name":"DevOps Lab"}` |
| GET | `/frontend/index.html` | Serves frontend page from Flask | `HTML page content` |

## 2. Architecture Diagram
```text
User Browser
    |
    | HTTP :5000
    v
AWS EC2 (Ubuntu 22.04, t2.micro)
    |
    | Docker Engine
    v
Docker Container (Portfolio-Generator image)
    |
    | Flask app + static frontend files
    v
API Routes (/health, /api/*) and Frontend (/frontend/index.html)
```

## 3. Tools and Technologies
| Tool | Why Used |
|---|---|
| Linux (Ubuntu 22.04) | Host operating system on EC2 for running Dockerized workloads |
| Python 3.11 | Backend programming language used to implement API logic |
| Flask | Lightweight web framework to expose API routes and serve frontend files |
| flask-cors | Enables cross-origin request handling for frontend/API interaction |
| pytest | Automated endpoint testing before deployment |
| Git | Local version control and commit history |
| GitHub | Remote repository hosting and collaboration platform |
| GitHub Actions | CI pipeline to run tests and Docker validation on push |
| Docker | Packages app and dependencies into a portable runtime image |
| AWS EC2 | Cloud compute environment for internet-accessible deployment |

## 4. Local Setup Instructions (Docker)
1. Clone the repository.
```bash
git clone <YOUR_REPOSITORY_URL>
cd Portfolio-Generator
```

2. Build the Docker image locally.
```bash
docker build -t portfolio-generator:v1 .
```

3. Run the container on port 5000.
```bash
docker run -d --name portfolio-generator-local -p 5000:5000 portfolio-generator:v1
```

4. Verify health endpoint.
```bash
curl http://localhost:5000/health
```

5. Verify frontend in browser.
```text
http://localhost:5000/frontend/index.html
```

6. Stop and remove local container after testing (optional cleanup).
```bash
docker stop portfolio-generator-local
docker rm portfolio-generator-local
```

## 5. CI/CD Pipeline Explanation
The workflow file is located at `.github/workflows/ci.yml` and triggers on every push to the `main` branch.

- **Job 1: `test`**
  - Checks out the repository.
  - Sets up Python 3.11.
  - Installs dependencies from `requirements.txt`.
  - Runs automated tests with:
```bash
python -m pytest test_app.py -v
```

- **Job 2: `build-docker`**
  - Runs only if the `test` job passes (`needs: test`).
  - Builds the Docker image.
  - Starts a temporary container.
  - Sends a health check request to `http://localhost:5000/health`.
  - Cleans up by removing the container.

If any test fails in the first job, the second job does not run. This prevents deploying or validating broken builds.

## 6. Deployment Steps on AWS EC2
1. Launch one EC2 instance with:
   - Instance type: `t2.micro`
   - AMI: Ubuntu Server 22.04 LTS
   - Storage: default 8 GB

2. Configure Security Group inbound rules:
   - TCP 22 (SSH) from your IP
   - TCP 5000 (application) from `0.0.0.0/0` (or restricted range for demo)

3. Connect to the instance via SSH from your local machine:
```bash
ssh -i "<PATH_TO_KEY.pem>" ubuntu@<EC2_PUBLIC_IP>
```

4. Install Docker on EC2:
```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker
docker --version
```

5. Clone repository on EC2:
```bash
git clone <YOUR_REPOSITORY_URL>
cd Portfolio-Generator
```

6. Build Docker image on EC2:
```bash
docker build -t portfolio-generator:v1 .
```

7. Run container with restart policy:
```bash
docker run -d --name portfolio-generator -p 5000:5000 --restart=always portfolio-generator:v1
```

8. Verify container status on EC2:
```bash
docker ps
```

9. Verify app from your local machine:
```bash
curl http://<EC2_PUBLIC_IP>:5000/health
```

10. Verify frontend in browser:
```text
http://<EC2_PUBLIC_IP>:5000/frontend/index.html
```

## 7. Testing Evidence
Add screenshots or command output for each item below in the final submission.

1. **Pytest passing locally**
```bash
python -m pytest test_app.py -v
```
Expected: all tests pass.

2. **GitHub Actions pipeline green**
- Screenshot of Actions tab showing both `test` and `build-docker` jobs passing on `main`.

3. **Live health check from local machine to EC2**
```bash
curl http://<EC2_PUBLIC_IP>:5000/health
```
Expected:
```json
{"status":"ok"}
```

4. **Container running on EC2**
```bash
ssh -i "<PATH_TO_KEY.pem>" ubuntu@<EC2_PUBLIC_IP>
docker ps
```
Expected: container named `portfolio-generator` is `Up` and mapped to `0.0.0.0:5000->5000/tcp`.

5. **POST endpoint test against live server**
```bash
curl -X POST "http://<EC2_PUBLIC_IP>:5000/api/items" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Live Demo Item\"}"
```
Expected: JSON response with `id` and `name`.

## 8. Challenges and Solutions
### Challenge 1: Frontend worked locally but failed on EC2
- **Problem:** Frontend JavaScript used `http://localhost:5000/api/items`, which points to the viewer's own machine in a browser context.
- **Solution:** Changed API call to relative path `/api/items` so browser uses the same host serving the page.
- **Result:** Frontend form works correctly when accessed through EC2 public IP.

### Challenge 2: Frontend files were not directly accessible from Flask routes
- **Problem:** API was running, but frontend files needed explicit serving from the Flask app.
- **Solution:** Added Flask route `GET /frontend/<path:filename>` using `send_from_directory("frontend", filename)` and made root redirect to `/frontend/index.html`.
- **Result:** Frontend and stylesheet load from the same Flask container without separate web server setup.

## 9. Lessons Learned
1. CI is most useful when it enforces dependency order (`build-docker` should depend on passing tests).
2. Docker works best when `.dockerignore` is clean, reducing context size and avoiding accidental file inclusion.
3. Cloud networking is often the first deployment failure point; correct security group rules are essential.
4. Relative frontend API URLs are safer for deployments than hardcoded localhost URLs.
5. `--restart=always` is important for service resilience after server reboot or daemon restart.

## EC2 Deployment Checklist
- [ ] EC2 instance is `t2.micro` running Ubuntu 22.04
- [ ] Security group allows TCP 22 and TCP 5000
- [ ] Docker is installed and running on EC2
- [ ] Repository cloned on EC2
- [ ] Image built: `docker build -t portfolio-generator:v1 .`
- [ ] Container started with `--restart=always`
- [ ] `docker ps` confirms container is running
- [ ] `curl http://<EC2_PUBLIC_IP>:5000/health` returns `{"status":"ok"}`
- [ ] Frontend opens at `http://<EC2_PUBLIC_IP>:5000/frontend/index.html`
