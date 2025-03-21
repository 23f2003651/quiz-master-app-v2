#!/bin/bash

# Start a new tmux session named "Project"
tmux new-session -d -s Project

# Create the Flask window
tmux rename-window -t Project:0 "Flask"
tmux send-keys -t Project "source .env/bin/activate; clear; python app.py" C-m

# Create the Celery Worker window
tmux new-window -t Project -n "CeleryWorker"
tmux send-keys -t Project:1 "source .env/bin/activate; clear; celery -A app:celery_app worker -l INFO" C-m

# Create the Celery Beat window
tmux new-window -t Project -n "CeleryBeat"
tmux send-keys -t Project:2 "source .env/bin/activate; clear; celery -A app:celery_app beat -l INFO" C-m

# Create the MailHog Window
tmux new-window -t Project -n "MailHog"
tmux send-keys -t Project:3 "source .env/bin/activate; clear; ~/go/bin/MailHog" C-m

# Create the Redis window
tmux new-window -t Project -n "Redis"
tmux send-keys -t Project:4 "sudo service redis-server start; clear; sudo service redis-server status" C-m

# Attach to the tmux session
tmux attach-session -t Project
