PROJECT_ID := geosight
export COMPOSE_FILE=deployment/docker-compose.yml:deployment/docker-compose.override.yml

SHELL := /usr/bin/env bash

# ----------------------------------------------------------------------------
#    P R O D U C T I O N     C O M M A N D S
# ----------------------------------------------------------------------------
setup:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Run the setup.sh"
	@echo "------------------------------------------------------------------"
	./setup.sh

build:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Building in production mode"
	@echo "------------------------------------------------------------------"
	@docker compose build

up: setup
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running in production mode"
	@echo "------------------------------------------------------------------"
	@docker compose ${ARGS} up -d nginx

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

production-check:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Run production check"
	@echo "------------------------------------------------------------------"
	@docker compose exec -T dev python production_prep_check.py

# ----------------------------------
# --------------- help -------------
# ----------------------------------

help:
	@echo "* **build** - builds all required containers."
	@echo "* **up** - runs all production containers."
	@echo "* **down** - kills all running containers."
	@echo "* **down** - kills all running containers."

# ----------------------------------------------------------------------------
#    D E V E L O P M E N T     C O M M A N D S
# ----------------------------------------------------------------------------

wait-db:
	@docker compose ${ARGS} exec -T db su - postgres -c "until pg_isready; do sleep 5; done"

sleep:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Sleep for 50 seconds"
	@echo "------------------------------------------------------------------"
	@sleep 50
	@echo "Done"

# ----------------------------------
# --------------- DEV --------------
# ----------------------------------

dev: down setup
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running in DEVELOPMENT mode"
	@echo "------------------------------------------------------------------"
	@if [ ! -d deployment/volumes/tmp_data/redis ]; then \
		echo "Creating deployment/volumes/tmp_data/redis and setting permissions..."; \
		sudo mkdir -p deployment/volumes/tmp_data/redis; \
		sudo chown -R 1001:1001 deployment/volumes/tmp_data/redis; \
	else \
	    sudo chown -R 1001:1001 deployment/volumes/tmp_data/redis; \
		echo "Directory already exists: deployment/volumes/tmp_data/redis"; \
	fi
	@docker compose ${ARGS} up -d dev

dev-ci-test:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running in DEVELOPMENT mode for CI test"
	@echo "------------------------------------------------------------------"
	@docker compose ${ARGS} up --no-recreate --no-deps -d db worker redis dev

dev-entrypoint:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running entrypoint.sh in DEVELOPMENT mode"
	@echo "------------------------------------------------------------------"
	@docker compose ${ARGS} exec -T dev "/home/web/django_project/entrypoint.sh"

dev-initialize:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running initialize.py in DEVELOPMENT mode"
	@echo "------------------------------------------------------------------"
	@docker compose $(ARGS) exec -T dev bash -c "python -u /home/web/django_project/initialize.py"

dev-runserver:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Start django runserver in dev container"
	@echo "------------------------------------------------------------------"
	@docker compose $(ARGS) exec -T dev bash -c "nohup python manage.py runserver 0.0.0.0:2000 &"

load-test-data:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Load demo data for dev"
	@echo "------------------------------------------------------------------"
	@docker compose $(ARGS) exec -T dev bash -c "python manage.py load_demo_data"

dev-test:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Run tests"
	@echo "------------------------------------------------------------------"
	@docker compose exec -T dev python manage.py test --keepdb --noinput

dev-shell:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Run shell"
	@echo "------------------------------------------------------------------"
	@docker compose exec dev /bin/bash

load-test-data-for-filter:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Load test data for testing filter functionality"
	@echo "------------------------------------------------------------------"
	@docker compose $(ARGS) exec -T dev bash -c "python manage.py loaddata core/fixtures/admin_filter/1.user_group.json"
	@docker compose $(ARGS) exec -T dev bash -c "python manage.py loaddata core/fixtures/admin_filter/2.geosight_data.json"

flake8:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Running flake8"
	@echo "------------------------------------------------------------------"
	@pip install flake8 flake8-docstrings pydoclint[flake8]
	@files=`{ \
		git diff --name-only origin/main; \
		git ls-files --others --exclude-standard; \
	} | grep '\.py$$' | sort -u`; \
	echo "$$files"; \
	if [ -n "$$files" ]; then flake8 $$files; else echo "No Python files to lint."; fi
