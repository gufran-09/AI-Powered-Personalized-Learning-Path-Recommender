FROM python:3.13-slim

WORKDIR /app

# Install system deps for LightGBM
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ app/
COPY training/ training/

# Create data and models directories (both are generated at build time)
RUN mkdir -p data models

# Generate training data and train models at build time
RUN python -m training.train_all --rows 10000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
