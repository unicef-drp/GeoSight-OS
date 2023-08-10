#!/usr/bin/env bash

export PATH=$PATH:/nix/store/zl7fpambb4db6by8mhl9xcmr6n1pp98c-gnused-4.9/bin/
#for FILE in $(ls ../django_project/*.py)
for FILE in $(/nix/store/jids6qqs36p4ds9ghpkcw57kbhp8lbq2-findutils-4.9.0/bin/find ../django_project/ *.py | grep ".py" | grep -v "pyc" | grep -v "migrations" | grep -v "tests" | grep -v ".js" | grep -v "node_modules")
do 
  NEWFILE=$(echo $FILE | sed 's/\.\.\//::: /g'| sed 's/\//./g'| sed 's/.py//g')
  echo $NEWFILE
done
