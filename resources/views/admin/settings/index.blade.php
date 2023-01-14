@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'basic'])

@section('title')
    設置
@endsection

@section('content-header')
    <h1>面板設置<small>配置面板.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li class="active">設置</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')
    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">面板設置</h3>
                </div>
                <form action="{{ route('admin.settings') }}" method="POST">
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">公司名稱</label>
                                <div>
                                    <input type="text" class="form-control" name="app:name" value="{{ old('app:name', config('app.name')) }}" />
                                    <p class="text-muted"><small>這是整個面板和發送給使用者的電子郵箱中使用的名稱.</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">要求動態口令認證登錄</label>
                                <div>
                                    <div class="btn-group" data-toggle="buttons">
                                        @php
                                            $level = old('pterodactyl:auth:2fa_required', config('pterodactyl.auth.2fa_required'));
                                        @endphp
                                        <label class="btn btn-primary @if ($level == 0) active @endif">
                                            <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="0" @if ($level == 0) checked @endif> 不要求
                                        </label>
                                        <label class="btn btn-primary @if ($level == 1) active @endif">
                                            <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="1" @if ($level == 1) checked @endif> 僅限管理員
                                        </label>
                                        <label class="btn btn-primary @if ($level == 2) active @endif">
                                            <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="2" @if ($level == 2) checked @endif> 所有用戶
                                        </label>
                                    </div>
                                    <p class="text-muted"><small>如果啟用，任何屬於所選分組的帳戶都需要啟用動態口令認證才能使用面板.</small></p>
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
                                    <p class="text-muted"><small>此功能需要面板的首位使用者設置為相應的語言，返回這裡並再按一次保存，即可同步</small></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="box-footer">
                        {!! csrf_field() !!}
                        <button type="submit" name="_method" value="PATCH" class="btn btn-sm btn-primary pull-right">保存</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection

