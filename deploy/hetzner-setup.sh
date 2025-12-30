#!/bin/bash

# Hetzner VPS Setup Script for Next.js App
# Run this script on your Hetzner VPS to set up the environment

set -e

echo "🚀 Setting up Hetzner VPS for Next.js deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verify Node.js installation
NODE_VERSION=$(node -v)
echo "✅ Node.js installed: $NODE_VERSION"

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install nginx
echo "📦 Installing nginx..."
sudo apt install -y nginx

# Create app directory
APP_DIR="/var/www/ikdweb"
echo "📁 Creating app directory at $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Create PM2 log directory
echo "📁 Creating PM2 log directory..."
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Create logs directory in app
mkdir -p $APP_DIR/logs

# Setup PM2 to start on boot
echo "⚙️  Configuring PM2 to start on boot..."
pm2 startup systemd -u $USER --hp /home/$USER
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

# Create nginx configuration
echo "⚙️  Creating nginx configuration..."
sudo tee /etc/nginx/sites-available/ikdweb > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (uncomment after SSL setup)
    # return 301 https://\$server_name\$request_uri;

    # For initial setup, proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/ikdweb /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🔍 Testing nginx configuration..."
sudo nginx -t

# Restart nginx
echo "🔄 Restarting nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo ""
echo "✅ Hetzner VPS setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit /etc/nginx/sites-available/ikdweb and replace 'your-domain.com' with your domain"
echo "2. Set up SSL with Let's Encrypt:"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d your-domain.com -d www.your-domain.com"
echo "3. Generate SSH key for GitHub Actions:"
echo "   ssh-keygen -t ed25519 -C 'github-actions' -f ~/.ssh/hetzner_deploy"
echo "4. Add public key to this VPS:"
echo "   cat ~/.ssh/hetzner_deploy.pub >> ~/.ssh/authorized_keys"
echo "5. Add GitHub Secrets:"
echo "   - HETZNER_SSH_HOST: Your VPS IP or domain"
echo "   - HETZNER_SSH_USER: Your SSH username"
echo "   - HETZNER_SSH_KEY: Contents of ~/.ssh/hetzner_deploy (private key)"
echo "   - HETZNER_DEPLOY_PATH: /var/www/ikdweb"
echo "6. Push to GitHub to trigger deployment!"
echo ""

