@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'basic'])

@section('title')
    設定
@endsection

@section('content-header')
    <h1>面板設定<small>根據您的喜好配置 Pterodactyl。</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理員</a></li>
        <li class="active">設定</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')
    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">面板設定</h3>
                </div>
                <form action="{{ route('admin.settings') }}" method="POST">
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">面板名稱</label>
                                <div>
                                    <input type="text" class="form-control" name="app:name" value="{{ old('app:name', config('app.name')) }}" />
                                    <p class="text-muted"><small>這是在面板中使用的名稱，以及發送給客戶的郵件中使用的名稱。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">需要雙因素(2FA)驗證</label>
                                <div>
                                    <div class="btn-group" data-toggle="buttons">
                                        @php
                                            $level = old('pterodactyl:auth:2fa_required', config('pterodactyl.auth.2fa_required'));
                                        @endphp
                                        <label class="btn btn-primary @if ($level == 0) active @endif">
                                            <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="0" @if ($level == 0) checked @endif> 不需要
                                        </label>
                                        <label class="btn btn-primary @if ($level == 1) active @endif">
                                            <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="1" @if ($level == 1) checked @endif> 只限管理員
                                        </label>
                                        <label class="btn btn-primary @if ($level == 2) active @endif">
                                            <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="2" @if ($level == 2) checked @endif> 所有使用者
                                        </label>
                                    </div>
                                    <p class="text-muted"><small>如果啟用，任何帳戶屬於所選組別的帳戶將需要啟用 2-Factor 驗證以使用面板。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">預設語言</label>
                                <div>
                                    <select name="app:locale" class="form-control">
                                        @foreach($languages as $key => $value)
                                            <option value="{{ $key }}" @if(config('app.locale') === $key) selected @endif>{{ $value }}</option>
                                        @endforeach
                                    </select>
                                    <p class="text-muted"><small>渲染 UI 元件時使用的預設語言。</small></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="box-footer">
                        {!! csrf_field() !!}
                        <button type="submit" name="_method" value="PATCH" class="btn btn-sm btn-primary pull-right">儲存</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection
