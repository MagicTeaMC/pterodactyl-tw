<?php

return [
    /*
    |--------------------------------------------------------------------------
    | 驗證語言行
    |--------------------------------------------------------------------------
    |
    | 以下語言行包含驗證器類使用的默認錯誤消息。一些規則有多個版本，
    | 例如大小規則。您可以隨意在這裡微調每個消息。
    |
    */

    'accepted' => ':attribute 必須被接受。',
    'active_url' => ':attribute 不是一個有效的URL。',
    'after' => ':attribute 必須是 :date 之後的日期。',
    'after_or_equal' => ':attribute 必須是 :date 或之後的日期。',
    'alpha' => ':attribute 只能包含字母。',
    'alpha_dash' => ':attribute 只能包含字母、數字和破折號。',
    'alpha_num' => ':attribute 只能包含字母和數字。',
    'array' => ':attribute 必須是一個數組。',
    'before' => ':attribute 必須是 :date 之前的日期。',
    'before_or_equal' => ':attribute 必須是 :date 或之前的日期。',
    'between' => [
        'numeric' => ':attribute 必須介於 :min 和 :max 之間。',
        'file' => ':attribute 必須介於 :min 和 :max kilobytes 之間。',
        'string' => ':attribute 必須介於 :min 和 :max 字符之間。',
        'array' => ':attribute 必須包含 :min 到 :max 項。',
    ],
    'boolean' => ':attribute 字段必須為 true 或 false。',
    'confirmed' => ':attribute 确认不匹配。',
    'date' => ':attribute 不是一个有效的日期。',
    'date_format' => ':attribute 不匹配格式 :format。',
    'different' => ':attribute 和 :other 必須不同。',
    'digits' => ':attribute 必須是 :digits 位數字。',
    'digits_between' => ':attribute 必須介於 :min 和 :max 位數字之間。',
    'dimensions' => ':attribute 具有無效的圖片尺寸。',
    'distinct' => ':attribute 字段具有重複的值。',
    'email' => ':attribute 必須是一個有效的電子郵件地址。',
    'exists' => '所選的 :attribute 無效。',
    'file' => ':attribute 必須是一個文件。',
    'filled' => ':attribute 字段是必需的。',
    'image' => ':attribute 必須是一個圖片。',
    'in' => '所選的 :attribute 無效。',
    'in_array' => ':attribute 字段在 :other 中不存在。',
    'integer' => ':attribute 必須是一個整數。',
    'ip' => ':attribute 必須是一個有效的 IP 地址。',
    'json' => ':attribute 必須是一個有效的 JSON 字符串。',
    'max' => [
        'numeric' => ':attribute 不得大於 :max。',
        'file' => ':attribute 不得大於 :max kilobytes。',
        'string' => ':attribute 不得大於 :max 字符。',
        'array' => ':attribute 不得超過 :max 項。',
    ],
    'mimes' => ':attribute 必須是類型為 :values 的文件。',
    'mimetypes' => ':attribute 必須是類型為 :values 的文件。',
    'min' => [
        'numeric' => ':attribute 必須至少為 :min。',
        'file' => ':attribute 必須至少為 :min kilobytes。',
        'string' => ':attribute 必須至少為 :min 字符。',
        'array' => ':attribute 必須至少包含 :min 項。',
    ],
    'not_in' => '所選的 :attribute 無效。',
    'numeric' => ':attribute 必須是一個數字。',
    'present' => ':attribute 字段必須存在。',
    'regex' => ':attribute 格式無效。',
    'required' => ':attribute 字段是必需的。',
    'required_if' => ':attribute 字段在 :other 是 :value 時是必需的。',
    'required_unless' => ':attribute 字段在 :other 不在 :values 中時是必需的。',
    'required_with' => ':attribute 字段在 :values 存在時是必需的。',
    'required_with_all' => ':attribute 字段在 :values 存在時是必需的。',
    'required_without' => ':attribute 字段在 :values 不存在時是必需的。',
    'required_without_all' => ':attribute 字段在 :values 中不存在時是必需的。',
    'same' => ':attribute 和 :other 必須匹配。',
    'size' => [
        'numeric' => ':attribute 必須是 :size。',
        'file' => ':attribute 必須是 :size kilobytes。',
        'string' => ':attribute 必須是 :size 字符。',
        'array' => ':attribute 必須包含 :size 項。',
    ],
    'string' => ':attribute 必須是一個字符串。',
    'timezone' => ':attribute 必須是一個有效的時區。',
    'unique' => ':attribute 已經被使用。',
    'uploaded' => ':attribute 上傳失敗。',
    'url' => ':attribute 格式無效。',

    /*
    |--------------------------------------------------------------------------
    | 自定義驗證屬性
    |--------------------------------------------------------------------------
    |
    | 以下語言行用於將屬性占位符替換為一些更讀者友好的東西，例如
    | "email" 而不是 "email"。這只是幫助我們使消息更加整潔。
    |
    */

    'attributes' => [],

    // Pterodactyl 的內部驗證邏輯
    'internal' => [
        'variable_value' => ':env 變數',
        'invalid_password' => '提供的密碼對於此帳戶無效。',
    ],
];
