---
title: GeoSight-OS Documentation Home 
summary: GeoSight is UNICEF's geospatial web-based business intelligence platform.
    - Tim Sutton
    - Irwan Fathurrahman
date: 2023-08-03
some_url: https://github.com/unicef-drp/GeoSight-OS
copyright: Copyright 2023, Unicef
contact: geosight-no-reply@unicef.org
license: This program is free software; you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.
#context_id: 1234
---

- ## Prerequisites:
	- Using Ubuntu 22.04
	- Official Docker installed and membership of the docker group see https://docs.docker.com/engine/install/ubuntu/
		-
		  ```
		  sudo usermod -a -G docker $user
		  ```
		- (Restart your computer after making this change)
	- docker-compose installed - version 1.29 or later should work fine
		- ![image.png](../assets/image_1693206822853_0.png)
	- Git Installed
	- VSCode installed
		- You need the the  VSCode Dev containers extension installed (minimum version 0.304.0)
		  ![image.png](../assets/image_1693206558667_0.png)  
		  ![image.png](../assets/image_1693206723551_0.png){:height 312, :width 689}  


# Preparation 

## Dependencies installation

The project provide **make** command that making setup process easier.
To install make on your machine or virtual box server, do:

```
sudo apt install make
```

Project has recipe that you can use to run the project in one command.
This recipe needs docker-compose to be able to use it.
To install it, do:

```
sudo apt install docker-compose
apt install ca-certificates curl gnup lsb-release  
```

## Docker installation

The project needs docker to be able to run it. To install it, please follow below instruction.

```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg     
```

On the next prompt line:

```
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg]https:download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Run apt update:

```
sudo apt-get update
```

This will install docker
```
sudo apt-get install  docker-ce-cli containerd.io
```

This will check if installation of docker was successful
```
sudo docker version
```
And it should return like this

```
Client: Docker Engine - Community
 Version:           20.10.9
 API version:       1.41
 Go version:        go1.16.8
 Git commit:        c2ea9bc
 Built:             Mon Oct  4 16:08:29 2021
 OS/Arch:           linux/amd64
 Context:           default
 Experimental:      true

```

### Manage docker as non-root

This will ensure that the docker can be executed without sudo.
```
sudo systemctl daemon-reload
sudo systemctl start docker
sudo usermod -a -G $USER
sudo systemctl enable docker
```

Verify that you can run docker commands without sudo.
```
docker run hello-world
```

For more information how to install docker, please visit [Install Docker Engine](https://docs.docker.com/engine/install/)