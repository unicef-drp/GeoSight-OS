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

# Default
ARG PLATFORM=linux/amd64
# Uncomment for Apple Silicon (M1, M2, or later) chips
#ARG PLATFORM=linux/arm64

FROM --platform=$PLATFORM ubuntu:20.04 AS prod

MAINTAINER Irwan Fathurrahman<meomancer@gmail.com>

# Pandoc needed to generate rst dumps, uic compressor needed for django-pipeline
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update -y
RUN apt-get install -y python3-pip python3-dev gdal-bin gettext libcurl4-openssl-dev libssl-dev yui-compressor git vim
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
RUN apt-get install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install nodejs -y

ADD django_project /home/web/django_project

# Install chrome for selenium
# TODO: Change how to get the Nunjucks results without browser
# This will not works on ARM (Macbook M1/M2) Ubuntu VM
# WORKDIR /home/web/django_project/selenium
# RUN apt-get install chromium-browser -y
RUN echo "deb http://archive.ubuntu.com/ubuntu/ bionic-updates universe" >> /etc/apt/sources.list.d/bionic-updates.list
RUN echo "Package: chromium-browser chromium-browser-l10n chromium-codecs-ffmpeg-extra chromium-codecs-ffmpeg\n\
Pin: release a=bionic-updates\n\
Pin-Priority: 900" >> /etc/apt/preferences.d/chromium-deb-bionic-updates
RUN apt-get update
RUN apt-get install chromium-browser -y --fix-missing

# Open port 8080 as we will be running our uwsgi socket on that
EXPOSE 8080

WORKDIR /home/web/django_project
ENTRYPOINT ["/home/web/django_project/entrypoint.sh"]
CMD ["uwsgi", "--ini", "/uwsgi.conf"]
# end of prod Dockerfile

FROM prod AS dev

# This section taken on 2 July 2015 from
# https://docs.docker.com/examples/running_ssh_service/
# Sudo is needed by pycharm when it tries to pip install packages
RUN apt-get update && apt-get install -y openssh-server sudo
RUN mkdir /var/run/sshd
RUN echo 'root:docker' | chpasswd
RUN sed -i 's/^PermitRootLogin */#PermitRootLogin /' /etc/ssh/sshd_config
RUN echo "PermitRootLogin yes" >> /etc/ssh/sshd_config

# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

# End of cut & paste section

ADD deployment/docker/requirements-dev.txt /requirements-dev.txt
RUN pip install -r /requirements-dev.txt

# --------------------------------------------------------
# Open ports as needed
# --------------------------------------------------------

# Open port 8080 as we will be running our django dev server on
EXPOSE 8080
# Open port 22 as we will be using a remote interpreter from pycharm
EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]