# ============================
# Backend: Django + Gunicorn
# ============================
FROM python:3.11-slim AS backend

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ .

# Expose backend port
EXPOSE 4000

# Run Gunicorn
CMD ["gunicorn", "fluxrent.wsgi:application", "--bind", "0.0.0.0:4000", "--workers", "4"]
