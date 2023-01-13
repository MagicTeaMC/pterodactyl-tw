<?php

/**
 * Pterodactyl CHINA - Panel
 * Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com>.
 *
 * This software is licensed under the terms of the MIT license.
 * https://opensource.org/licenses/MIT
 */

return [
    'location' => [
        'no_location_found' => '找不到與提供的標識碼匹配的記錄。',
        'ask_short' => '地域標識碼',
        'ask_long' => '地域描述',
        'created' => '已成功創建 ID 為 :id 的新地域 (:name)。',
        'deleted' => '已成功刪除請求的地域。',
    ],
    'user' => [
        'search_users' => '輸入用戶名、使用者 ID 或電子郵箱位址',
        'select_search_user' => '要刪除的用戶ID (輸入\'0\'重新搜索)',
        'deleted' => '已成功將該用戶從面板中刪除。',
        'confirm_delete' => '您確定要從面板中刪除此用戶嗎？',
        'no_users_found' => '提供的搜索詞未能找到相符的用戶。',
        'multiple_found' => '提供的搜索詞找到多個帳戶，由於 --no-interaction 標籤而無法刪除用戶。',
        'ask_admin' => '此用戶是否為管理員？',
        'ask_email' => '電子郵箱位址',
        'ask_username' => '用戶名',
        'ask_name_first' => '名字',
        'ask_name_last' => '姓氏',
        'ask_password' => '密碼',
        'ask_password_tip' => '如果您想使用通過電子郵件發送給使用者的隨機密碼創建一個帳戶，請重新運行此命令 (CTRL+C) 並傳遞 `--no-password` 標籤。',
        'ask_password_help' => '密碼長度必須至少為 8 個字元，並且至少包含一個大寫字母和數位。',
        '2fa_help_text' => [
            '如果啟用，此命令將禁用使用者帳戶的動態口令認證。僅當用戶被鎖定在其帳戶之外時，才應將其用作帳戶恢復命令。',
            '如果這不是您想要執行的操作，請按 CTRL+C 退出此過程。',
        ],
        '2fa_disabled' => '已為 :email 禁用動態口令認證。',
    ],
    'schedule' => [
        'output_line' => '為 `:schedule` (:hash) 中的第一個任務分配作業。',
    ],
    'maintenance' => [
        'deleting_service_backup' => '刪除服務備份檔案 :file。',
    ],
    'server' => [
        'rebuild_failed' => '在節點 ":node" 上對 ":name" (#:id) 的重建請求失敗並出現錯誤：:message',
        'reinstall' => [
            'failed' => '在節點 ":node" 上重新安裝 ":name" (#:id) 請求失敗並出現錯誤: :message',
            'confirm' => '您即將針對一組伺服器重新安裝。你想繼續嗎？',
        ],
        'power' => [
            'confirm' => '您即將對 :count 伺服器執行 :action。你想繼續嗎？',
            'action_failed' => '節點 ":node" 上 ":name" (#:id) 的電源操作請求失敗並出現錯誤: :message',
        ],
    ],
    'environment' => [
        'mail' => [
            'ask_smtp_host' => 'SMTP 主機 (例如 smtp.gmail.com)',
            'ask_smtp_port' => 'SMTP 埠',
            'ask_smtp_username' => 'SMTP 用戶名',
            'ask_smtp_password' => 'SMTP 密碼',
            'ask_mailgun_domain' => 'Mailgun 功能變數名稱',
            'ask_mailgun_endpoint' => 'Mailgun 節點',
            'ask_mailgun_secret' => 'Mailgun Secret',
            'ask_mandrill_secret' => 'Mandrill Secret',
            'ask_postmark_username' => 'Postmark API 金鑰',
            'ask_driver' => '應該使用哪個驅動程式來發送電子郵件?',
            'ask_mail_from' => '寄件者地址',
            'ask_mail_name' => '寄件者',
            'ask_encryption' => '加密方式',
        ],
    ],
];

