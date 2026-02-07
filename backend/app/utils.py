import uuid
from datetime import datetime

def generate_serial():
    year = datetime.now().year
    short = uuid.uuid4().hex[:6].upper()
    return f"CP-{year}-{short}"
