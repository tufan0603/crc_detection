FROM python:3.10-slim

WORKDIR /app

# System libs needed by opencv and pydicom
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU-only first (much smaller than GPU version ~700MB vs 2GB)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code and models
COPY . .

# Create uploads temp directory
RUN mkdir -p uploads

EXPOSE 7860

CMD ["gunicorn", "app:app", "--workers", "1", "--timeout", "300", "--bind", "0.0.0.0:7860"]
