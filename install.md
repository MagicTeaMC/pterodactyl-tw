# 安裝面板
注意：此安裝文檔假設您目前使用Ubuntu 20
## 從原版替換
### 進入維護模式
```
cd /var/www/pterodactyl

php artisan down
```
### 下載面板
```
curl -L https://github.com/pterodactyl-china/panel/releases/latest/download/panel.tar.gz | tar -xzv
```
### 修改目錄權限
```
chmod -R 755 storage/* bootstrap/cache
```
### 清除暫存檔案
```
php artisan view:clear
php artisan config:clear
```
### 設定權限
```
chown -R www-data:www-data /var/www/pterodactyl/*
```
### 重啟工作
```
php artisan queue:restart
```
### 離開維護模式
```
php artisan up
```
