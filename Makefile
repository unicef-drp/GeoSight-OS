PROJECT_ID := geosight
export COMPOSE_FILE=deployment/docker-compose.yml:deployment/docker-compose.override.yml
export ONEDRIVE_DATA_DIR=$(shell pwd)/deployment/onedrive/data

SHELL := /usr/bin/env bash

# ----------------------------------------------------------------------------
#    P R O D U C T I O N     C O M M A N D S
# ----------------------------------------------------------------------------
default: web
run: build web collectstatic

deploy: run
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Bringing up fresh instance "
	@echo "You can access it on http://localhost"
	@echo "------------------------------------------------------------------"

web:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running in production mode"
	@echo "------------------------------------------------------------------"
	@docker compose up -d

frontend-dev:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Run frontend dev"
	@echo "------------------------------------------------------------------"
	@cd django_project/frontend; npm run dev;

dev:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running in dev mode"
	@echo "------------------------------------------------------------------"
	@docker compose ${ARGS} up -d dev

dev-kill:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Kill dev"
	@echo "------------------------------------------------------------------"
	@docker kill $(PROJECT_ID)_dev

dev-reload: dev-kill dev
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Reload DEV"
	@echo "------------------------------------------------------------------"

build:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Building in production mode"
	@echo "------------------------------------------------------------------"
	@docker compose build

nginx:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running nginx in production mode"
	@echo "Normally you should use this only for testing"
	@echo "In a production environment you will typically use nginx running"
	@echo "on the host rather if you have a multi-site host."
	@echo "------------------------------------------------------------------"
	@docker compose up -d nginx
	@echo "Site should now be available at http://localhost"

up: web

status:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Show status for all containers"
	@echo "------------------------------------------------------------------"
	@docker compose ps

kill:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Killing in production mode"
	@echo "------------------------------------------------------------------"
	@docker compose stop

down: kill
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Removing production instance!!! "
	@echo "------------------------------------------------------------------"
	@docker compose down

update: up
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Update production instance"
	@echo "------------------------------------------------------------------"
	@docker compose ${ARGS} restart django worker nginx

shell:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Shelling in in production mode"
	@echo "------------------------------------------------------------------"
	@docker compose exec django /bin/bash

db-bash:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Entering DB Bash in production mode"
	@echo "------------------------------------------------------------------"
	@docker compose exec db sh

db-shell:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Entering PostgreSQL Shell in production mode"
	@echo "------------------------------------------------------------------"
	docker compose exec db su - postgres -c "psql"

collectstatic:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Collecting static in production mode"
	@echo "------------------------------------------------------------------"
	#@docker compose run django python manage.py collectstatic --noinput
	#We need to run collect static in the same context as the running
	# django container it seems so I use docker exec here
	# no -it flag so we can run over remote shell
	@docker exec $(PROJECT_ID)_django python manage.py collectstatic --noinput

reload:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Reload django project in production mode"
	@echo "------------------------------------------------------------------"
	# no -it flag so we can run over remote shell
	@docker exec $(PROJECT_ID)_django django --reload  /tmp/django.pid

migrate:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running migrate static in production mode"
	@echo "------------------------------------------------------------------"
	@docker compose exec django python manage.py migrate

# --------------- help --------------------------------

help:
	@echo "* **build** - builds all required containers."
	@echo "* **up** - runs all required containers."
	@echo "* **kill** - kills all running containers. Does not remove them."
	@echo "* **logs** - view the logs of all running containers. Note that you can also view individual logs in the deployment/logs directory."
	@echo "* **nginx** - builds and runs the nginx container."
	@echo "* **permissions** - Update the permissions of shared volumes. Note this will destroy any existing permissions you have in place."
	@echo "* **rm** - remove all containers."
	@echo "* **shell-frontend-mapstore** - open a bash shell in the frontend mapstore (where django runs) container."

# ----------------------------------------------------------------------------
#    DEVELOPMENT C O M M A N D S
# --no-deps will attach to prod deps if running
# after running you will have ssh and web ports open (see dockerfile for no's)
# and you can set your pycharm to use the python in the container
# Note that pycharm will copy in resources to the /root/ user folder
# for pydevd etc. If they dont get copied, restart pycharm...
# ----------------------------------------------------------------------------
db:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running db in production mode"
	@echo "------------------------------------------------------------------"
	@docker compose ${ARGS} up -d db

wait-db:
	@docker compose ${ARGS} exec -T db su - postgres -c "until pg_isready; do sleep 5; done"

devweb: db
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running in DEVELOPMENT mode"
	@echo "------------------------------------------------------------------"
	@docker compose ${ARGS} up --no-recreate --no-deps -d dev redis

devweb-entrypoint:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running entrypoint.sh in DEVELOPMENT mode"
	@echo "------------------------------------------------------------------"
	@docker compose ${ARGS} exec -T dev "/home/web/django_project/entrypoint.sh"

devweb-initialize:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running initialize.py in DEVELOPMENT mode"
	@echo "------------------------------------------------------------------"
	@docker compose $(ARGS) exec -T dev bash -c "python -u /home/web/django_project/initialize.py"

sleep:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Sleep for 50 seconds"
	@echo "------------------------------------------------------------------"
	@sleep 50
	@echo "Done"

production-check:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Run production check"
	@echo "------------------------------------------------------------------"
	@docker compose exec -T dev python production_prep_check.py

devweb-runserver:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Start django runserver in dev container"
	@echo "------------------------------------------------------------------"
	@docker compose $(ARGS) exec -T dev bash -c "nohup python manage.py runserver 0.0.0.0:2000 &"

devweb-load-demo-data:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Load demo data for devweb"
	@echo "------------------------------------------------------------------"
	@docker compose $(ARGS) exec -T dev bash -c "python manage.py loaddata core/fixtures/demo/1.core.json"
	@docker compose $(ARGS) exec -T dev bash -c "python manage.py loaddata core/fixtures/demo/2.user_group.json"
	@docker compose $(ARGS) exec -T dev bash -c "python manage.py loaddata core/fixtures/demo/3.geosight_georepo.json"
	@docker compose $(ARGS) exec -T dev bash -c "python manage.py loaddata geosight/reference_dataset/fixtures/test/4.reference_dataset_levels.json"
	@docker compose $(ARGS) exec -T dev bash -c "python manage.py loaddata core/fixtures/demo/4.geosight_data.json"

load-test-data: devweb-load-demo-data

load-test-data-for-filter:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Load test data for testing filter functionality"
	@echo "------------------------------------------------------------------"
	@docker compose $(ARGS) exec -T dev bash -c "python manage.py loaddata core/fixtures/admin_filter/1.user_group.json"
	@docker compose $(ARGS) exec -T dev bash -c "python manage.py loaddata core/fixtures/admin_filter/2.geosight_data.json"

devweb-test:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Run tests"
	@echo "------------------------------------------------------------------"
	@docker compose exec -T dev python manage.py test --keepdb --noinput

devweb-shell:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Run shell"
	@echo "------------------------------------------------------------------"
	@docker compose exec dev /bin/bash
# --------------- TESTS ---------------
run-flake8:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running flake8"
	@echo "------------------------------------------------------------------"
	@pip install flake8==6.0.0
	@pip install flake8-docstrings
	@python3 -m flake8
