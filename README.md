# SE202L DevOps Lab Project and ICT Project

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


<img width="1280" height="578" alt="image" src="https://github.com/user-attachments/assets/17114e73-21f6-4161-8ff5-bcf4d4fde1b6" />
<img width="1280" height="483" alt="image" src="https://github.com/user-attachments/assets/c91b1bd3-57d5-46bd-846e-6704830a542b" />
<img width="1280" height="595" alt="image" src="https://github.com/user-attachments/assets/bd6317ba-195a-4260-ac72-956d86fc48b5" />


