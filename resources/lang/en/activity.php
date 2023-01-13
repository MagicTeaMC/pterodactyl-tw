<?php

/**
 * Contains all of the translation strings for different activity log
 * events. These should be keyed by the value in front of the colon (:)
 * in the event name. If there is no colon present, they should live at
 * the top level.
 */
return [
    'auth' => [
        'fail' => '登錄失敗',
        'success' => '已登入',
        'password-reset' => '重設密碼',
        'reset-password' => '請求密碼重置',
        'checkpoint' => '請求動態口令認證',
        'recovery-token' => '使用了動態口令恢復代碼',
        'token' => '正確輸入了動態口令',
        'ip-blocked' => '阻止不在IP白名單裡的請求',
        'sftp' => [
            'fail' => 'SFTP 登錄失敗',
        ],
    ],
    'user' => [
        'account' => [
            'email-changed' => '已將電子郵箱從 :old 更改為 :new',
            'password-changed' => '已更改密碼',
        ],
        'api-key' => [
            'create' => '創建新的 API 金鑰 :identifier',
            'delete' => '已刪除 API 金鑰 :identifier',
        ],
        'ssh-key' => [
            'create' => '將 SSH 私密金鑰 :fingerprint 添加到帳戶',
            'delete' => '從帳戶中刪除了 SSH 私密金鑰 :fingerprint',
        ],
        'two-factor' => [
            'create' => '啟用動態口令認證',
            'delete' => '禁用動態口令認證',
        ],
    ],
    'server' => [
        'reinstall' => '重裝伺服器',
        'console' => [
            'command' => '在伺服器上執行 ":command"',
        ],
        'power' => [
            'start' => '啟動了伺服器',
            'stop' => '停止了伺服器',
            'restart' => '重啟了伺服器',
            'kill' => '強制停止了伺服器',
        ],
        'backup' => [
            'download' => '下載了 :name 備份',
            'delete' => '刪除了 :name 備份',
            'restore' => '恢復了 :name 備份 (已刪除檔: :truncate)',
            'restore-complete' => '已成功恢復 :name 備份',
            'restore-failed' => ':name 備份恢復失敗',
            'start' => ':name 開始了新的一輪備份',
            'complete' => '已將 :name 備份標記為完成',
            'fail' => '已將 :name 備份標記為失敗',
            'lock' => '鎖定了 :name 備份',
            'unlock' => '解鎖了 :name 備份',
        ],
        'database' => [
            'create' => '創建新資料庫 :name',
            'rotate-password' => '為資料庫 :name 輪換密碼',
            'delete' => '已刪除資料庫 :name',
        ],
        'file' => [
            'compress_one' => '壓縮了 :directory:file',
            'compress_other' => '在 :directory 路徑下壓縮了 :count 個文件',
            'read' => '查看了 :file 的內容',
            'copy' => '創建了 :file 的副本',
            'create-directory' => '已創建目錄 :directory:name',
            'decompress' => '解壓了 :directory 路徑下的 :files',
            'delete_one' => '刪除了 :directory:files.0',
            'delete_other' => '刪除了 :directory 路徑下的 :count 個文件',
            'download' => '下載 :file',
            'pull' => '從 :url 下載遠程文件到 :directory 路徑下',
            'rename_one' => '將 :directory:files.0.from 重命名為 :directory:files.0.to',
            'rename_other' => '在 :directory 路徑下重命名了 :count 個文件',
            'write' => '寫了一些新內容到 :file 中',
            'upload' => '上傳了一些文件',
            'uploaded' => '已上傳 :directory:file',
        ],
        'sftp' => [
            'denied' => '由於許可權原因阻止了 SFTP 訪問',
            'create_one' => '創建了 :files.0',
            'create_other' => '創建了新的 :count 文件',
            'write_one' => '修改了 :files.0 的內容',
            'write_other' => '修改了 :count 檔的內容',
            'delete_one' => '刪除了 :files.0',
            'delete_other' => '刪除了 :count 文件',
            'create-directory_one' => '創建了 :files.0 目錄',
            'create-directory_other' => '創建了 :count 個目錄',
            'rename_one' => '將 :files.0.from 重命名為 :files.0.to',
            'rename_other' => '重命名或移動了 :count 個文件',
        ],
        'allocation' => [
            'create' => '添加 :allocation 到伺服器',
            'notes' => '將 :allocation 的備註從 ":old" 更新為 ":new"',
            'primary' => '將 :allocation 設置為伺服器首選',
            'delete' => '刪除了 :allocation 分配',
        ],
        'schedule' => [
            'create' => '創建了 :name 計畫',
            'update' => '更新了 :name 計畫',
            'execute' => '手動執行了 :name 計畫',
            'delete' => '刪除了 :name 計畫',
        ],
        'task' => [
            'create' => '為 :name 計畫創建了一個新的 ":action" 任務',
            'update' => '更新了 :name 計畫的 ":action" 任務',
            'delete' => '刪除了 :name 計畫的一個任務',
        ],
        'settings' => [
            'rename' => '將伺服器從 :old 重命名為 :new',
            'description' => '將伺服器描述從 :old 更改為 :new',
        ],
        'startup' => [
            'edit' => '將 :variable 變數從 ":old" 更改為 ":new"',
            'image' => '將伺服器的 Docker 映射從 :old 更新為 :new',
        ],
        'subuser' => [
            'create' => '將 :email 添加為子用戶',
            'update' => '更新了 :email 的子用戶許可權',
            'delete' => '將 :email 從子用戶中刪除',
        ],
    ],
];
