# 安裝方法
只需下載`tar.gz`文件，移到面板所在 root 目錄，並且解壓縮，並且執行以下指令。  
```
cd /var/www/pterodactyl
php artisan down
composer install --no-dev --optimize-autoloader
php artisan view:clear
php artisan config:clear
php artisan migrate --seed --force
chown -R www-data:www-data /var/www/pterodactyl/*
php artisan queue:restart
```