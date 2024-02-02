<?php

return [
    'location' => [
        'no_location_found' => '找不到與提供的簡碼相匹配的記錄。',
        'ask_short' => '位置簡碼',
        'ask_long' => '位置描述',
        'created' => '成功創建新的位置 (:name)，ID 為 :id。',
        'deleted' => '成功刪除所請求的位置。',
    ],
    'user' => [
        'search_users' => '輸入用戶名、用戶ID或電子郵件地址',
        'select_search_user' => '要刪除的用戶ID（輸入\'0\'重新搜索）',
        'deleted' => '用戶成功從面板中刪除。',
        'confirm_delete' => '您確定要從面板中刪除此用戶嗎？',
        'no_users_found' => '未找到符合提供的搜索條件的用戶。',
        'multiple_found' => '找到了提供的用戶的多個帳戶，由於 --no-interaction 標誌的存在，無法刪除用戶。',
        'ask_admin' => '此用戶是否為管理員？',
        'ask_email' => '電子郵件地址',
        'ask_username' => '用戶名',
        'ask_name_first' => '名字',
        'ask_name_last' => '姓氏',
        'ask_password' => '密碼',
        'ask_password_tip' => '如果您想使用隨機密碼向用戶發送電子郵件來創建帳戶，請重新運行此命令（CTRL+C）並傳遞 `--no-password` 標誌。',
        'ask_password_help' => '密碼必須至少包含 8 個字符，並且應包含至少一個大寫字母和一個數字。',
        '2fa_help_text' => [
            '如果啟用了用戶帳戶的雙重驗證，此命令將禁用它。這應僅用作用戶無法訪問其帳戶時的帳戶恢復命令。',
            '如果這不是您想要做的事情，請按 CTRL+C 退出此流程。',
        ],
        '2fa_disabled' => '已為 :email 禁用 2 啟用身份驗證。',
    ],
    'schedule' => [
        'output_line' => '正在調度 `:schedule`（:hash）中的第一個任務。',
    ],
    'maintenance' => [
        'deleting_service_backup' => '正在刪除服務備份文件 :file。',
    ],
    'server' => [
        'rebuild_failed' => '在節點 ":node" 上重建 ":name"（#:id）的請求失敗，錯誤訊息為：:message',
        'reinstall' => [
            'failed' => '在節點 ":node" 上重新安裝 ":name"（#:id）的請求失敗，錯誤訊息為：:message',
            'confirm' => '您將對一組服務器執行重新安裝。您是否要繼續？',
        ],
        'power' => [
            'confirm' => '您將對 :count 台服務器執行 :action。您是否要繼續？',
            'action_failed' => '在節點 ":node" 上的 ":name"（#:id）的電源操作請求失敗，錯誤訊息為：:message',
        ],
    ],
    'environment' => [
        'mail' => [
            'ask_smtp_host' => 'SMTP 主機（例如 smtp.gmail.com）',
            'ask_smtp_port' => 'SMTP 端口',
            'ask_smtp_username' => 'SMTP 用戶名',
            'ask_smtp_password' => 'SMTP 密碼',
            'ask_mailgun_domain' => 'Mailgun 域',
            'ask_mailgun_endpoint' => 'Mailgun 端點',
            'ask_mailgun_secret' => 'Mailgun 密鑰',
            'ask_mandrill_secret' => 'Mandrill 密鑰',
            'ask_postmark_username' => 'Postmark API 密鑰',
            'ask_driver' => '發送電子郵件時應使用哪個驅動程序？',
            'ask_mail_from' => '電子郵件地址的發件人',
            'ask_mail_name' => '電子郵件應該顯示的名稱',
            'ask_encryption' => '要使用的加密方法',
        ],
    ],
];
