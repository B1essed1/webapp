#!/bin/bash

# Simple setup script for Telegram Voting App

echo "Setting up Telegram Voting App service..."

# Copy service file
sudo cp telegram-voting-app.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable telegram-voting-app.service

# Start service
sudo systemctl start telegram-voting-app.service

# Check status
sudo systemctl status telegram-voting-app.service

echo "Setup completed! Service is now running."
echo "Use these commands to manage the service:"
echo "  sudo systemctl status telegram-voting-app.service"
echo "  sudo systemctl restart telegram-voting-app.service" 
echo "  sudo systemctl stop telegram-voting-app.service"
echo "  sudo systemctl start telegram-voting-app.service"