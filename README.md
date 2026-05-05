# SE202L DevOps Lab Project

This project includes a Flask backend, simple HTML/CSS frontend, Docker support, and CI pipeline.

## Run locally (without Docker)

```bash
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Then open:
- API health: `http://localhost:5000/health`
- Frontend file: `frontend/index.html`

## Run tests

```bash
python -m pytest test_app.py -v
```

## Docker

```bash
docker build -t se202l-app:v1 .
docker run -d --name se202l-app -p 5000:5000 --restart=always se202l-app:v1
```
