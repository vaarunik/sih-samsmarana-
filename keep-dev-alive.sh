#!/bin/bash
# Keep the Next.js dev server alive. Idempotent — only starts if not running.
if ! pgrep -f "next-server" > /dev/null 2>&1 && ! pgrep -f "next dev -p 3000" > /dev/null 2>&1; then
  cd /home/z/my-project
  setsid bash -c 'exec node_modules/.bin/next dev -p 3000 > dev.log 2>&1' </dev/null >/dev/null 2>&1 &
  disown -a 2>/dev/null || true
fi
