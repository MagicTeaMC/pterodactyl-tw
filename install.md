# 安裝方法
只需下載`tar.gz`文件，移到面板所在 root 目錄，並且解壓縮，並且執行以下指令。  
```
cd /var/www/pterodactyl
php artisan down
php artisan queue:restart
php artisan up
```