<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers\Databases;

use Webmozart\Assert\Assert;
use Pterodactyl\Models\Server;
use Illuminate\Validation\Rule;
use Pterodactyl\Models\Database;
use Pterodactyl\Models\Permission;
use Illuminate\Database\Query\Builder;
use Pterodactyl\Contracts\Http\ClientPermissionsRequest;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;
use Pterodactyl\Services\Databases\DatabaseManagementService;

class StoreDatabaseRequest extends ClientApiRequest implements ClientPermissionsRequest
{
    public function permission(): string
    {
        return Permission::ACTION_DATABASE_CREATE;
    }

    public function rules(): array
    {
        /** @var Server $server */
        $server = $this->route()->parameter('server');

        Assert::isInstanceOf($server, Server::class);

        return [
            'database' => [
                'required',
                'alpha_dash',
                'min:3',
                'max:48',
                // Yes, I am aware that you could have the same database name across two unique hosts. However,
                // I don't really care about that for this validation. We just want to make sure it is unique to
                // the server itself. No need for complexity.
                Rule::unique('databases')->where(function (Builder $query) use ($server) {
                    $query->where('server_id', $server->id)
                        ->where('database', DatabaseManagementService::generateUniqueDatabaseName($this->input('database'), $server->id));
                }),
            ],
            'remote' => Database::getRulesForField('remote'),
        ];
    }

    public function messages(): array
    {
        return [
            'database.unique' => '你选择的数据库名已经被这个服务器使用。',
        ];
    }
}
