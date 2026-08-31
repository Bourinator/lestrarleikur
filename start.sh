#!/bin/sh
# Ræsir Stafaleikinn á http://localhost:8080
cd "$(dirname "$0")"
open http://localhost:8080
exec python3 -m http.server 8080
