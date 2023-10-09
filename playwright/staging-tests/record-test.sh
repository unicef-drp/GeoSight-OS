#!/usr/bin/env bash

if [ -z "$1" ]
then
  echo "Usage: $0 TESTNAME"
  echo "e.g. $0 mytest"
  echo "will write a new test to tests/mytest.py"
  echo "Do not use spaces in your test name."
  echo ""
  echo "After recording your test, close the test browser."
  echo "You can then run your test by doing:"
  echo "pytest tests/mytest.py"
  exit
else
  echo "Recording test to tests\$1"
fi

if [ -w "tests/${1}.py" ]; then
   # File exists and write permission granted to user
   # show prompt
   echo "File tests/${1}.py exists. Overwrite? y/n"
   read ANSWER
   case $ANSWER in 
       [yY] ) echo "Writing recorded test to tests/${1}.py" ;;
       [nN] ) echo "Cancelled."; exit ;;
   esac
fi
TESTNAME=$1

playwright \
  codegen \
  --target python \
  --timezone="Europe/Lisbon" \
  --geolocation="41.890221,12.492348" \
  --lang="pt-PT" \
  --load-storage=geosight-auth.json \
  -o tests/$TESTNAME.py \
  https://staging-geosight.unitst.org

echo "Test recording completed."
echo "You can then run your test by doing:"
echo "pytest tests/$1.py"
