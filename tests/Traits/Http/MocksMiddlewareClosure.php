<?php

namespace Pterodactyl\Tests\Traits\Http;

use Closure;
use Illuminate\Http\Request;

trait MocksMiddlewareClosure
{
    /**
     * Provide a closure to be used when validating that the response from the middleware
     * is the same request object we passed into it.
     */
    protected function getClosureAssertions(): \Closure
    {
        if (is_null($this->request)) {
            throw new \BadFunctionCallException('不支持在不定义请求对象的情况下调用 getClosureAssertions。');
        }

        return function ($response) {
            $this->assertInstanceOf(Request::class, $response);
            $this->assertSame($this->request, $response);
        };
    }
}
