FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app

# OS deps for psycopg2, build, and other typical packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    netcat \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first (caches)
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy project
COPY . /app

# Collect static files
ENV DJANGO_SETTINGS_MODULE=fluxrent.settings
RUN python manage.py collectstatic --noinput || true

# Entrypoint script ensures migrations and seed run at container start
COPY docker-start.sh /app/docker-start.sh
RUN chmod +x /app/docker-start.sh

EXPOSE 4000

CMD ["/app/docker-start.sh"]
