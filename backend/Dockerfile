FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Use ENTRYPOINT+CMD split so $PORT expands in shell
ENTRYPOINT ["/bin/sh", "-c"]
CMD ["echo 'Starting on port '${PORT:-8000} && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info"]
