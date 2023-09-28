#!/usr/bin/env bash

echo "This script will write a new test to tests/deleteme.py"
echo "then delete it, leaving only the auth config."
echo ""
echo "When the playwright browser opens, log in to the site then exit."
echo "After recording your test, close the test browser."
echo "Recording auth token to geosight-auth.json"

# File exists and write permission granted to user
# show prompt
echo "Continue? y/n"
read ANSWER
case $ANSWER in 
  [yY] ) echo "Writing geosight-auth.json" ;;
  [nN] ) echo "Cancelled."; exit ;;
esac

playwright \
  codegen \
  --target python \
  --timezone="Europe/Lisbon" \
  --geolocation="41.890221,12.492348" \
  --lang="pt-PT" \
  --save-storage=geosight-auth.json \
  -o tests/deleteme.py \
  https://staging.geosight.kartoza.com

# We are only interested in geosight-auth.json
rm tests/deleteme.py

echo "Auth file creation completed."
echo "You can then run your tests by doing e.g.:"
echo "pytest tests/filename.py"
