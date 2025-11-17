# Set the python version as a build-time argument
# with Python 3.12 as the default
ARG PYTHON_VERSION=3.12-slim-bullseye
FROM python:${PYTHON_VERSION}

ENV ORT_NO_GPU=1
# Create a virtual environment
RUN python -m venv /opt/venv

# Set the virtual environment as the current location
ENV PATH=/opt/venv/bin:$PATH

# Upgrade pip
RUN pip install --upgrade pip

# Set Python-related environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install os dependencies for our mini vm
RUN apt-get update && apt-get install -y \
    # for postgres
    libpq-dev \
    # for Pillow
    libjpeg-dev \
    # other
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt /tmp/requirements.txt


# Install the Python project requirements
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Pre-download U²-Net model so it's ready at runtime
RUN python3 -c "from rembg import new_session; print('Downloading U2Net model...'); new_session('u2net')"

# copy the project code into the container's working directory
COPY . .


ENV PROJ_NAME="flowsheet"


# static files don't change often

RUN python manage.py collectstatic --noinput 


# make the bash script executable
RUN chmod +x entrypoint.sh

# Clean up apt cache to reduce image size
RUN apt-get remove --purge -y \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


ENTRYPOINT ["./entrypoint.sh"]
# Run the Django project via the runtime script
# when the container starts
CMD ["gunicorn"]