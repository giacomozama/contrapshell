#!/bin/bash

if [ "$1" = "check" ]; then
    if [ "$(pidof hypridle)" = "" ]; then
        echo "yes"
    else
        echo "no"
    fi
else
    if [ "$(pidof hypridle)" = "" ]; then
        hyprctl dispatch exec hypridle
    else
        killall hypridle
    fi
fi

exit 0
