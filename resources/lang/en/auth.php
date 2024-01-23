<?php

return [
    'sign_in' => '登入',
    'go_to_login' => '前往登入',
    'failed' => '找不到符合這些資訊的帳戶。',

    'forgot_password' => [
        'label' => '忘記密碼？',
        'label_help' => '輸入您的帳戶電子郵件地址以接收重設密碼的指示。',
        'button' => '恢復帳戶',
    ],

    'reset_password' => [
        'button' => '重設並登入',
    ],

    'two_factor' => [
        'label' => '雙因素驗證碼',
        'label_help' => '為了繼續，此帳戶需要第二層身份驗證(2FA)。請輸入您的設備生成的代碼以完成登入。',
        'checkpoint_failed' => '雙因素身份驗證令牌無效。',
    ],

    'throttle' => '嘗試登入次數過多。請在 :seconds 秒後再試一次。',
    'password_requirements' => '密碼必須至少包含 8 個字符，並應該是此站點獨有的。',
    '2fa_must_be_enabled' => '管理員要求啟用您帳戶的雙因素身份驗證(2FA)，以使用控制面板。',
];
