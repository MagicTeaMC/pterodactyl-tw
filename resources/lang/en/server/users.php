<?php

/**
 * Pterodactyl CHINA - Panel
 * Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com>.
 *
 * This software is licensed under the terms of the MIT license.
 * https://opensource.org/licenses/MIT
 */

return [
    'permissions' => [
        'websocket_*' => '允許訪問此伺服器的 websocket。',
        'control_console' => '允許使用者通過控制台向伺服器實例發送命令。',
        'control_start' => '允許用戶在伺服器停止時啟動它。',
        'control_stop' => '允許用戶停止正在運行的伺服器。',
        'control_restart' => '允許使用者重新開機伺服器實例。',
        'control_kill' => '允許使用者強制停止伺服器實例。',
        'user_create' => '允許用戶為伺服器創建新的子用戶。',
        'user_read' => '允許用戶查看與此伺服器關聯的子用戶許可權。',
        'user_update' => '允許用戶修改與此伺服器關聯的子用戶。',
        'user_delete' => '允許用戶刪除與此伺服器關聯的子用戶。',
        'file_create' => '允許用戶通過面板或直接上傳、創建其他檔和資料夾。',
        'file_read' => '允許使用者查看目錄的內容，但不能查看或下載檔案的內容。',
        'file_update' => '允許使用者更新現有檔或目錄的內容。',
        'file_delete' => '允許使用者刪除檔或目錄。',
        'file_archive' => '允許使用者壓縮系統上的的檔以及解壓系統上的現有壓縮檔。',
        'file_sftp' => '允許用戶使用其他分配的檔許可權連接到 SFTP 並管理伺服器文件。',
        'allocation_read' => '允許訪問伺服器分配管理頁面。',
        'allocation_update' => '允許用戶修改伺服器分配的許可權。',
        'database_create' => '允許使用者為伺服器創建新資料庫的許可權。',
        'database_read' => '允許使用者查看伺服器資料庫的許可權。',
        'database_update' => '允許使用者修改資料庫的許可權。如果用戶沒有 "VIEW_PASSWORD" 許可權，那麼他將無法修改密碼。',
        'database_delete' => '允許使用者刪除資料庫實例的許可權。',
        'database_view_password' => '允許使用者在系統中查看資料庫密碼。',
        'schedule_create' => '允許用戶為此伺服器創建新計畫。',
        'schedule_read' => '允許用戶查看此伺服器的計畫和與其關聯的任務。',
        'schedule_update' => '允許用戶更新此伺服器的計畫和計畫中的任務。',
        'schedule_delete' => '允許用戶刪除此伺服器的計畫。',
    ],
];
