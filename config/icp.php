<?php
/*
|--------------------------------------------------------------------------
| ICP License Configuration
|--------------------------------------------------------------------------
|
| Web services in China require ICP license, a permit issued by the Chinese government
| to permit China-based websites to operate in China. In order to fulfill the
| conditions, you should apply for ICP license from your service provider.
|
*/

return [
    /*
     * Enable or disable ICP
     */
    'enabled' => env('ICP_ENABLED', false),

    /*
     * ICP record
     */
    'record' => env('ICP_RECORD'),

    /*
     * Public security record
     */
    'security_record' => env('ICP_SECURITY_RECORD'),
];
