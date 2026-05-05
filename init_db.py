from app import ITEMS


def initialize_data():
    ITEMS.clear()
    ITEMS.extend([
        {"id": 1, "name": "Sample Portfolio"},
        {"id": 2, "name": "DevOps Demo"},
    ])


if __name__ == "__main__":
    initialize_data()
    print("Sample data initialized.")
