#!/bin/bash
set -e
set -x

echo "Starting GitHunter Bind StarWS..."
cat /app/hosts >> /etc/hosts
cat /etc/hosts

node /app/githunter-starws.js
