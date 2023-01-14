<?php

namespace Pterodactyl\Exceptions\Solutions;

use Spatie\Ignition\Contracts\Solution;

class ManifestDoesNotExistSolution implements Solution
{
    public function getSolutionTitle(): string
    {
        return 'manifest.json 文件尚未生成';
    }

    public function getSolutionDescription(): string
    {
        return '首先运行 yarn run build:production 来构建前端。';
    }

    public function getDocumentationLinks(): array
    {
        return [
            'Docs' => 'https://github.com/pterodactyl-china/panel/blob/develop/package.json',
        ];
    }
}
