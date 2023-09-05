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

#
#FROM python:3.8-alpine3.11 AS base
#MAINTAINER Irwan Fathurrahman<meomancer@gmail.com>
#
## Pandoc needed to generate rst dumps, uic compressor needed for django-pipeline
#ENV DEBIAN_FRONTEND noninteractive
#RUN apk add --no-cache --virtual .build-deps python3-dev gcc libc-dev linux-headers musl-dev libffi-dev py3-pip gdal gettext curl-dev libressl-dev \
#    py3-yuicompressor git vim dpkg ca-certificates wget
#RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
#RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.25-r0/glibc-2.25-r0.apk
#RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.25-r0/glibc-bin-2.25-r0.apk
#RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.25-r0/glibc-i18n-2.25-r0.apk
#RUN apk add --force-overwrite --no-cache --virtual .build-deps glibc-bin-2.25-r0.apk glibc-i18n-2.25-r0.apk glibc-2.25-r0.apk
#
#ENV PATH /usr/local/bin:$PATH
#
#ADD deployment/docker/uwsgi.conf /uwsgi.conf
#
#ADD deployment/docker/locale.md /locale.md
#RUN cat locale.md | xargs -i /usr/glibc-compat/bin/localedef -i {} -f UTF-8 {}.UTF-8
#
#ENV LANG en_ZA.UTF-8
#ENV LANGUAGE en_ZA:en
#ENV LC_ALL en_ZA.UTF-8


FROM kartoza/geosight:0.3.0 AS prod

ADD deployment/docker/requirements.txt /requirements.txt
RUN pip3 install --upgrade pip && pip install --upgrade pip
RUN pip install -r /requirements.txt

RUN ln -s /usr/bin/python3 /usr/local/bin/python

# setup node
RUN curl -sL https://deb.nodesource.com/setup_18.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apk add --force-overwrite --no-cache --virtual .build-deps nodejs -y

ADD django_project /home/web/django_project

# Install chrome for selenium
# TODO: Change how to get the Nunjucks results without browser
WORKDIR /home/web/django_project/selenium
RUN yes | dpkg -i ./google-chrome-stable_current_amd64.deb

RUN find /usr/local \
        \( -type d -a -name test -o -name tests \) \
        -o \( -type f -a -name '*.pyc' -o -name '*.pyo' \) \
        -exec rm -rf '{}' + \
    && runDeps="$( \
        scanelf --needed --nobanner --recursive /usr/local \
                | awk '{ gsub(/,/, "\nso:", $2); print "so:" $2 }' \
                | sort -u \
                | xargs -r apk info --installed \
                | sort -u \
    )" \
    && apk add --virtual .rundeps $runDeps \
    && apk del .build-deps

# Open port 8080 as we will be running our uwsgi socket on that
EXPOSE 8080

WORKDIR /home/web/django_project
ENTRYPOINT ["/home/web/django_project/entrypoint.sh"]
CMD ["uwsgi", "--ini", "/uwsgi.conf"]

FROM prod AS dev

# This section taken on 2 July 2015 from
# https://docs.docker.com/examples/running_ssh_service/
# Sudo is needed by pycharm when it tries to pip install packages
RUN apk add --no-cache --virtual .build-deps openssh-server sudo
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
