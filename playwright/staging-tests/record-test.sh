#!/usr/bin/env bash

if [ -z "$1" ]
then
  echo "Usage: $0 TESTNAME"
  echo "e.g. $0 mytest"
  echo "will write a new test to tests/mytest.ts"
  echo "Do not use spaces in your test name."
  echo ""
  echo "After recording your test, close the test browser."
  echo "You can then run your test by doing:"
  echo "pytest tests/mytest.ts"
  exit
else
  echo "Recording test to tests\$1"
fi

if [ -w "tests/${1}.ts" ]; then
   # File exists and write permission granted to user
   # show prompt
   echo "File tests/${1}.ts exists. Overwrite? y/n"
   read ANSWER
   case $ANSWER in 
       [yY] ) echo "Writing recorded test to tests/${1}.py" ;;
       [nN] ) echo "Cancelled."; exit ;;
   esac
fi
TESTNAME=$1

playwright \
  codegen \
  --target playwright-test \
  --load-storage=geosight-auth.json \
  -o tests/$TESTNAME.ts \
  https://staging-geosight.unitst.org

echo "Test recording completed."
echo "You can then run your test by doing:"
echo "playwright test --project chromium tests/$1.ts"
