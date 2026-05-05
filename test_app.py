import pytest

from app import app, ITEMS


@pytest.fixture()
def client():
    app.config["TESTING"] = True
    with app.test_client() as test_client:
        ITEMS.clear()
        yield test_client


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}


def test_api_time_endpoint(client):
    response = client.get("/api/time")
    assert response.status_code == 200
    assert "server_time_utc" in response.get_json()


def test_create_item_success(client):
    response = client.post("/api/items", json={"name": "Portfolio Project"})
    assert response.status_code == 201
    body = response.get_json()
    assert body["id"] == 1
    assert body["name"] == "Portfolio Project"


def test_create_item_validation_error(client):
    response = client.post("/api/items", json={"name": ""})
    assert response.status_code == 400
    assert "error" in response.get_json()


def test_list_items_endpoint(client):
    client.post("/api/items", json={"name": "Item 1"})
    response = client.get("/api/items")
    assert response.status_code == 200
    body = response.get_json()
    assert body["count"] == 1
    assert len(body["items"]) == 1
