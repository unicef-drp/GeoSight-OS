FROM mcr.microsoft.com/devcontainers/base:0-alpine-3.20

COPY host-ca-certificates.crt /tmp/host-ca-certificates.crt
RUN cat /tmp/host-ca-certificates.crt >> /etc/ssl/certs/ca-certificates.crt
RUN csplit -f /usr/local/share/ca-certificates/host-ca-certificate- -b '%02d.pem' -z -s /tmp/host-ca-certificates.crt '/-----BEGIN CERTIFICATE-----/' '{*}'
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

# Avoiding OpenSSH >8.8 for compatibility for now: https://github.com/microsoft/vscode-remote-release/issues/7482
RUN echo "@old https://dl-cdn.alpinelinux.org/alpine/v3.15/main" >> /etc/apk/repositories

RUN apk add --no-cache \
	git-lfs \
	nodejs \
	python3 \
	npm \
	make \
	g++ \
	docker-cli \
	docker-cli-buildx \
	docker-cli-compose \
	openssh-client-default@old \
	;

RUN npm config set cafile /etc/ssl/certs/ca-certificates.crt && cd && npm i node-pty || echo "Continuing without node-pty."

COPY .vscode-remote-containers /root/.vscode-remote-containers
