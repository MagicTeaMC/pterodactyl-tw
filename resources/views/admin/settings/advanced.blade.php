@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'advanced'])

@section('title')
    高級設置
@endsection

@section('content-header')
    <h1>高級設置<small>pterodactyl面板的高級設置.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li class="active">設置</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')
    <div class="row">
        <div class="col-xs-12">
            <form action="" method="POST">
                <div class="box">
                    <div class="box-header with-border">
                        <h3 class="box-title">reCAPTCHA</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">狀態</label>
                                <div>
                                    <select class="form-control" name="recaptcha:enabled">
                                        <option value="true">啟用</option>
                                        <option value="false" @if(old('recaptcha:enabled', config('recaptcha.enabled')) == '0') selected @endif>禁用</option>
                                    </select>
                                    <p class="text-muted small">如果啟用，登錄表單和密碼重置表單將進行靜默驗證碼檢查，並在需要時顯示可見驗證碼.</p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Site Key</label>
                                <div>
                                    <input type="text" required class="form-control" name="recaptcha:website_key" value="{{ old('recaptcha:website_key', config('recaptcha.website_key')) }}">
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Secret Key</label>
                                <div>
                                    <input type="text" required class="form-control" name="recaptcha:secret_key" value="{{ old('recaptcha:secret_key', config('recaptcha.secret_key')) }}">
                                    <p class="text-muted small">用於您的網站與 Google 之間的通信。</p>
                                </div>
                            </div>
                        </div>
                        @if($showRecaptchaWarning)
                            <div class="row">
                                <div class="col-xs-12">
                                    <div class="alert alert-warning no-margin">
                                        您當前正在使用隨此面板提供的 reCAPTCHA 金鑰。為了提高安全性，建議專門為此網站 <a href="https://www.google.com/recaptcha/admin">生成新的 reCAPTCHA 金鑰</a>.
                                    </div>
                                </div>
                            </div>
                        @endif
                    </div>
                </div>
                <div class="box">
                    <div class="box-header with-border">
                        <h3 class="box-title">HTTP 連接</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-6">
                                <label class="control-label">連接逾時</label>
                                <div>
                                    <input type="number" required class="form-control" name="pterodactyl:guzzle:connect_timeout" value="{{ old('pterodactyl:guzzle:connect_timeout', config('pterodactyl.guzzle.connect_timeout')) }}">
                                    <p class="text-muted small">在引發錯誤提示之前等待連接完成的時間（以秒為單位）.</p>
                                </div>
                            </div>
                            <div class="form-group col-md-6">
                                <label class="control-label">請求超時</label>
                                <div>
                                    <input type="number" required class="form-control" name="pterodactyl:guzzle:timeout" value="{{ old('pterodactyl:guzzle:timeout', config('pterodactyl.guzzle.timeout')) }}">
                                    <p class="text-muted small">在引發錯誤提示之前等待請求完成的時間（以秒為單位）.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="box">
                    <div class="box-header with-border">
                        <h3 class="box-title">自動分配創建</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">狀態</label>
                                <div>
                                    <select class="form-control" name="pterodactyl:client_features:allocations:enabled">
                                        <option value="false">禁用</option>
                                        <option value="true" @if(old('pterodactyl:client_features:allocations:enabled', config('pterodactyl.client_features.allocations.enabled'))) selected @endif>啟用</option>
                                    </select>
                                    <p class="text-muted small">如果啟用，用戶將可以選擇通過前端自動為其伺服器創建新分配.</p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">起始埠</label>
                                <div>
                                    <input type="number" class="form-control" name="pterodactyl:client_features:allocations:range_start" value="{{ old('pterodactyl:client_features:allocations:range_start', config('pterodactyl.client_features.allocations.range_start')) }}">
                                    <p class="text-muted small">可自動分配範圍內的起始埠.</p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">結束埠</label>
                                <div>
                                    <input type="number" class="form-control" name="pterodactyl:client_features:allocations:range_end" value="{{ old('pterodactyl:client_features:allocations:range_end', config('pterodactyl.client_features.allocations.range_end')) }}">
                                    <p class="text-muted small">可自動分配範圍內的結束埠.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="box box-primary">
                    <div class="box-footer">
                        {{ csrf_field() }}
                        <button type="submit" name="_method" value="PATCH" class="btn btn-sm btn-primary pull-right">保存</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
@endsection

