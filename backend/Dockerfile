# backend/Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# system deps
RUN apt-get update && apt-get install -y build-essential curl netcat gcc libpq-dev --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# copy and install requirements
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt

# copy app
COPY . .

# expose port
EXPOSE 8000

# entrypoint: run migrations then start server (dev). For production swap with gunicorn.
CMD ["/bin/bash", "docker-start.sh"]
