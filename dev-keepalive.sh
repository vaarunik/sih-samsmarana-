#!/bin/bash
while true; do
  if ! pgrep -f "next-server" > /dev/null 2>&1; then
    cd /home/z/my-project
    node_modules/.bin/next dev -p 3000 > dev.log 2>&1 &
  fi
  sleep 10
done
