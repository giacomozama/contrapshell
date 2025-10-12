#!/bin/bash

for dir in "$@"; do
    cat $dir/appmanifest_*.acf | awk '
    /appid/{
      gsub(/"/,"")
      ID=$2
    }
    /name/{
      gsub(/"/,"")
      print ID"%"substr($0,index($0,$2))
    }
    '
done
