# Simple Deployment Setup

Just like your Spring Boot setup! 

## 🚀 Quick Setup

### 1. Server Setup (One Time)

```bash
# Clone your repo
cd /var/www
sudo git clone https://github.com/yourusername/telegram-voting-app.git
cd telegram-voting-app

# Install dependencies
npm install

# Build the app
npm run build

# Setup the service
chmod +x setup.sh
sudo ./setup.sh
```

### 2. GitHub Secrets

Add these to GitHub → Settings → Secrets:

- `HOST` = your server IP
- `USERNAME` = your SSH username  
- `PRIVATE_KEY` = your SSH private key
- `PORT` = 22 (your SSH port)

## ✅ That's It!

Now when you push to master:
1. GitHub Actions connects to your server
2. Pulls latest code
3. Builds the app
4. Restarts the service

## 🔧 Service Commands

```bash
# Check status
sudo systemctl status telegram-voting-app.service

# Restart 
sudo systemctl restart telegram-voting-app.service

# View logs
sudo journalctl -u telegram-voting-app.service -f

# Stop/Start
sudo systemctl stop telegram-voting-app.service
sudo systemctl start telegram-voting-app.service
```

Same as your Spring Boot service! 🎉