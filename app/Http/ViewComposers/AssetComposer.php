<?php

namespace Pterodactyl\Http\ViewComposers;

use Illuminate\View\View;

class AssetComposer
{
    /**
     * Provide access to the asset service in the views.
     */
    public function compose(View $view): void
    {
        $view->with('siteConfiguration', [
            'name' => config('app.name') ?? 'Pterodactyl',
            'locale' => config('app.locale') ?? 'zh',
            'recaptcha' => [
                'enabled' => config('recaptcha.enabled', false),
                'siteKey' => config('recaptcha.website_key') ?? '',
            ],
            'icp' => [
                'enabled' => config('icp.enabled', false),
                'record' => config('icp.record') ?? '',
                'security_record' => config('icp.security_record') ?? '',
            ],
        ]);
    }
}
