#!/bin/bash
# ==============================================================
# HaldiMeHendi - Hostinger VPS Deployment Script
# ==============================================================

echo "🚀 Starting HaldiMeHendi Deployment..."

# -----------------------------------------------
# 1. Update system
# -----------------------------------------------
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# -----------------------------------------------
# 2. Install Node.js 20.x
# -----------------------------------------------
echo "🟢 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# -----------------------------------------------
# 3. Install PM2 (Process Manager)
# -----------------------------------------------
echo "🔧 Installing PM2..."
sudo npm install -g pm2

# -----------------------------------------------
# 4. Create app directory
# -----------------------------------------------
echo "📁 Creating app directory..."
sudo mkdir -p /var/www/haldimehendi
sudo chown $USER:$USER /var/www/haldimehendi

# -----------------------------------------------
# 5. Clone/copy your project
# -----------------------------------------------
echo "📋 Copying project files..."
# Option A: If using Git
# git clone https://github.com/yourusername/haldimehendi.git /var/www/haldimehendi

# Option B: Upload via File Manager or SCP
# scp -r ./matrimonial/* user@your-vps:/var/www/haldimehendi/

# -----------------------------------------------
# 6. Install dependencies
# -----------------------------------------------
echo "📚 Installing dependencies..."
cd /var/www/haldimehendi
npm ci --production=false

# -----------------------------------------------
# 7. Create .env file
# -----------------------------------------------
echo "🔐 Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual values!"
    echo "    nano /var/www/haldimehendi/.env"
fi

# -----------------------------------------------
# 8. Build the application
# -----------------------------------------------
echo "🏗️  Building the application..."
npm run build

# -----------------------------------------------
# 9. Configure PM2
# -----------------------------------------------
echo "⚡ Configuring PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'haldimehendi',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/haldimehendi',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/haldimehendi/error.log',
    out_file: '/var/log/haldimehendi/out.log',
  }]
};
EOF

# -----------------------------------------------
# 10. Create log directory
# -----------------------------------------------
sudo mkdir -p /var/log/haldimehendi
sudo chown $USER:$USER /var/log/haldimehendi

# -----------------------------------------------
# 11. Start the application
# -----------------------------------------------
echo "🚀 Starting HaldiMeHendi..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# -----------------------------------------------
# 12. Configure Nginx (Optional - for reverse proxy)
# -----------------------------------------------
echo "🌐 Setting up Nginx reverse proxy..."
sudo apt install -y nginx

sudo cat > /etc/nginx/sites-available/haldimehendi << 'EOF'
server {
    listen 80;
    server_name haldimehendi.com www.haldimehendi.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/haldimehendi /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# -----------------------------------------------
# 13. Setup SSL with Certbot (Optional)
# -----------------------------------------------
echo "🔒 Setting up SSL..."
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d haldimehendi.com -d www.haldimehendi.com

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs haldimehendi"
echo "🔄 Restart: pm2 restart haldimehendi"
echo ""
echo "🌐 Your app should be running at: http://your-vps-ip:3000"
echo "🌐 Or via Nginx: http://haldimehendi.com"
