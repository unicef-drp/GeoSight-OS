# GeoSight is UNICEF's geospatial web-based business intelligence platform.
#
# Contact : geosight-no-reply@unicef.org
#
# .. note:: This program is free software; you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published by
#    the Free Software Foundation; either version 3 of the License, or
#    (at your option) any later version.
#
# __author__ = 'irwan@kartoza.com'
# __date__ = '13/06/2023'
# __copyright__ = ('Copyright 2023, Unicef')


FROM ubuntu:22.04 AS prod

ENV CACHE_BUSTER=22.12.2025
# ----------------------------------------------------------------
# NOTE: If you forgot to run setup.sh and you are arm architecture
#  And comment above FROM
# ----------------------------------------------------------------
#FROM --platform=linux/arm64 ubuntu:22.04 AS prod
# --------------------------------------------

MAINTAINER Irwan Fathurrahman<meomancer@gmail.com>

# Pandoc needed to generate rst dumps, uic compressor needed for django-pipeline
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update -y
RUN apt-get install -y jq wget python3-pip python3-dev gdal-bin gettext libcurl4-openssl-dev libssl-dev yui-compressor git vim
RUN apt-get update -y
RUN apt-get install -y libgdal-dev python3-gdal
RUN export GDAL_VERSION=$(gdal-config --version)

ENV PATH /usr/local/bin:$PATH

ADD deployment/docker/uwsgi.conf /uwsgi.conf

RUN apt-get install locales -y && \
    echo "en_ZA.UTF-8 UTF-8" >> /etc/locale.gen && \
    locale-gen en_ZA.UTF-8
ENV LANG en_ZA.UTF-8
ENV LANGUAGE en_ZA:en
ENV LC_ALL en_ZA.UTF-8

ADD deployment/docker/requirements.txt /requirements.txt
RUN pip3 install --upgrade pip && pip install --upgrade pip
RUN pip install -r /requirements.txt

RUN ln -s /usr/bin/python3 /usr/local/bin/python

# setup node
RUN apt-get update && apt-get install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install nodejs -y

# Install chrome for selenium
# TODO: Change how to get the Nunjucks results without browser
# This will not works on ARM (Macbook M1/M2) Ubuntu VM
# WORKDIR /home/web/django_project/selenium
# RUN apt-get install chromium-browser -y

# Download and install Google Chrome
RUN apt update
RUN apt install chromium-browser -y
CMD ["google-chrome", "--version"]

# Install matching ChromeDriver
RUN CHROME_VERSION=$(google-chrome --version | awk '{print $3}' | cut -d'.' -f1) && \
    DRIVER_URL=$(curl -s https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json | \
    jq -r --arg ver "$CHROME_VERSION" '.channels.Stable.downloads.chromedriver[] | select(.platform=="linux64") | .url') && \
    wget -O /tmp/chromedriver.zip "$DRIVER_URL" && \
    unzip /tmp/chromedriver.zip -d /tmp/ && \
    mv /tmp/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver && \
    chmod +x /usr/local/bin/chromedriver && \
    rm -rf /tmp/chromedriver*

# Test command (optional)
CMD ["chromedriver", "--version"]

ADD django_project /home/web/django_project

# Run NPM
WORKDIR /home/web/django_project/frontend
RUN echo "npm install"
RUN npm install --verbose
RUN echo "npm build"
RUN npm run build

# Open port 8080 as we will be running our uwsgi socket on that
EXPOSE 8080
EXPOSE 8000

WORKDIR /home/web/django_project
ENTRYPOINT ["/home/web/django_project/entrypoint.sh"]
CMD ["uwsgi", "--ini", "/uwsgi.conf"]
# end of prod Dockerfile