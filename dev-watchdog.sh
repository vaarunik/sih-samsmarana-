#!/bin/bash
while true; do
  if ! pgrep -f "next-server" > /dev/null 2>&1; then
    cd /home/z/my-project
    setsid bash -c 'exec node_modules/.bin/next dev -p 3000 > dev.log 2>&1' </dev/null >/dev/null 2>&1 &
    disown -a 2>/dev/null || true
  fi
  sleep 15
done
