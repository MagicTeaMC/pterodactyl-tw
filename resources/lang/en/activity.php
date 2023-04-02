<?php

/**
 * 包含各種活動日誌事件的所有翻譯字符串。這些應當以冒號（:）前面的值作為鍵值。
 * 如果沒有冒號，它們應該位於頂級層級。
 */
return [
    'auth' => [
        'fail' => '登錄失敗',
        'success' => '已登錄',
        'password-reset' => '密碼重設',
        'reset-password' => '請求重設密碼',
        'checkpoint' => '要求雙重身份驗證',
        'recovery-token' => '使用雙重身份驗證恢復令牌',
        'token' => '解決雙重身份驗證挑戰',
        'ip-blocked' => '阻止未列入白名單的IP地址的請求:identifier',
        'sftp' => [
            'fail' => 'SFTP 登錄失敗',
        ],
    ],
    'user' => [
        'account' => [
            'email-changed' => '將電子郵件從 :old 更改為 :new',
            'password-changed' => '更改密碼',
        ],
        'api-key' => [
            'create' => '創建新的API密鑰 :identifier',
            'delete' => '刪除API密鑰 :identifier',
        ],
        'ssh-key' => [
            'create' => '將SSH密鑰 :fingerprint 添加到帳戶中',
            'delete' => '從帳戶中刪除SSH密鑰 :fingerprint',
        ],
        'two-factor' => [
            'create' => '啟用雙重身份驗證',
            'delete' => '停用雙重身份驗證',
        ],
    ],
    'server' => [
        'reinstall' => '重新安裝伺服器',
        'console' => [
            'command' => '在伺服器上執行":command"',
        ],
        'power' => [
            'start' => '啟動伺服器',
            'stop' => '停止伺服器',
            'restart' => '重啟伺服器',
            'kill' => '終止伺服器進程',
        ],
        'backup' => [
            'download' => '下載 :name 備份',
            'delete' => '刪除 :name 備份',
            'restore' => '還原 :name 備份（已刪除的文件：:truncate）',
            'restore-complete' => '完成 :name 備份的還原',
            'restore-failed' => '無法完成 :name 備份的還原',
            'start' => '開始新的備份 :name',
            'complete' => '將 :name 備份標記為完成',
            'fail' => '將:name備份標記為失敗',
            'lock' => '鎖定:name備份',
            'unlock' => '解鎖:name備份',
            ],
            'database' => [
                'create' => '建立新的資料庫:name',
                'rotate-password' => '輪替資料庫:name的密碼',
                'delete' => '刪除資料庫:name',
            ],
            'file' => [
                'compress_one' => '壓縮:directory:file',
                'compress_other' => '壓縮:directory中的:count個檔案',
                'read' => '檢視檔案內容 :file',
                'copy' => '建立檔案複本 :file',
                'create-directory' => '建立目錄 :directory:name',
                'decompress' => '解壓縮:directory中的:files個檔案',
                'delete_one' => '刪除:directory:files.0',
                'delete_other' => '刪除:directory中的:count個檔案',
                'download' => '下載檔案 :file',
                'pull' => '從:url下載遠端檔案到:directory',
                'rename_one' => '將:directory:files.0.from改名為:directory:files.0.to',
                'rename_other' => '將:directory中的:count個檔案改名',
                'write' => '將新內容寫入檔案 :file',
                'upload' => '開始檔案上傳',
                'uploaded' => '上傳檔案 :directory:file',
            ],
            'sftp' => [
                'denied' => '因權限而封鎖SFTP存取',
                'create_one' => '建立:files.0',
                'create_other' => '建立:count個新檔案',
                'write_one' => '修改:files.0的內容',
                'write_other' => '修改:count個檔案的內容',
                'delete_one' => '刪除:files.0',
                'delete_other' => '刪除:count個檔案',
                'create-directory_one' => '建立:files.0目錄',
                'create-directory_other' => '建立:count個目錄',
                'rename_one' => '將:files.0.from改名為:files.0.to',
                'rename_other' => '改名或移動:count個檔案',
            ],
            'allocation' => [
                'create' => '新增:allocation至伺服器',
                'notes' => '將:allocation的備註從":old"更新為":new"',
                'primary' => '將 :allocation 設為主要',
                'delete' => '刪除 :allocation',
        ],
        'schedule' => [
            'create' => 'Created the :name schedule',
            'update' => 'Updated the :name schedule',
            'execute' => 'Manually executed the :name schedule',
            'delete' => 'Deleted the :name schedule',
        ],
        'task' => [
            'create' => 'Created a new ":action" task for the :name schedule',
            'update' => 'Updated the ":action" task for the :name schedule',
            'delete' => 'Deleted a task for the :name schedule',
        ],
        'settings' => [
            'rename' => 'Renamed the server from :old to :new',
            'description' => 'Changed the server description from :old to :new',
        ],
        'startup' => [
            'edit' => 'Changed the :variable variable from ":old" to ":new"',
            'image' => 'Updated the Docker Image for the server from :old to :new',
        ],
        'subuser' => [
            'create' => 'Added :email as a subuser',
            'update' => 'Updated the subuser permissions for :email',
            'delete' => 'Removed :email as a subuser',
        ],
    ],
];
