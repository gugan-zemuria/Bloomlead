#!/bin/bash
# BloomLead Deployment Script

echo "🚀 Deploying BloomLead website..."

# Create deployment folder
mkdir -p deploy

# Copy essential files
cp index.html deploy/
cp blog.html deploy/
cp coaches.html deploy/
cp contact.html deploy/
cp courses.html deploy/
cp courses-details.html deploy/
cp pricing.html deploy/
cp privacy-policy.html deploy/
cp terms-and-conditions.html deploy/

# Copy folders
cp -r css deploy/
cp -r js deploy/
cp -r img deploy/
cp -r fonts deploy/
cp -r fontawesome deploy/
cp -r blogs deploy/

# Create .htaccess for better performance
cat > deploy/.htaccess << 'EOF'
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css
    AddOutputFilterByType DEFLATE application/xml application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml application/javascript
</IfModule>

# Browser caching
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
</IfModule>

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
EOF

echo "✅ Files prepared in 'deploy' folder"
echo "📁 Upload the contents of 'deploy' folder to your web server"
echo "🌐 Your website will be live at https://bloomlead.io"