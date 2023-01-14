@extends('layouts.admin')

@section('title')
    管理用戶: {{ $user->username }}
@endsection

@section('content-header')
    <h1>{{ $user->name_first }} {{ $user->name_last}}<small>{{ $user->username }}</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li><a href="{{ route('admin.users') }}">用戶</a></li>
        <li class="active">{{ $user->username }}</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <form action="{{ route('admin.users.view', $user->id) }}" method="post">
        <div class="col-md-6">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">身份</h3>
                </div>
                <div class="box-body">
                    <div class="form-group">
                        <label for="email" class="control-label">電子郵箱位址</label>
                        <div>
                            <input type="email" name="email" value="{{ $user->email }}" class="form-control form-autocomplete-stop">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="registered" class="control-label">用戶名</label>
                        <div>
                            <input type="text" name="username" value="{{ $user->username }}" class="form-control form-autocomplete-stop">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="registered" class="control-label">姓</label>
                        <div>
                            <input type="text" name="name_first" value="{{ $user->name_first }}" class="form-control form-autocomplete-stop">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="registered" class="control-label">名</label>
                        <div>
                            <input type="text" name="name_last" value="{{ $user->name_last }}" class="form-control form-autocomplete-stop">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="control-label">預設語言</label>
                        <div>
                            <select name="language" class="form-control">
                                @foreach($languages as $key => $value)
                                    <option value="{{ $key }}" @if($user->language === $key) selected @endif>{{ $value }}</option>
                                @endforeach
                            </select>
                            <p class="text-muted"><small>使用者使用的預設語言.</small></p>
                        </div>
                    </div>
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    {!! method_field('PATCH') !!}
                    <input type="submit" value="更新用戶" class="btn btn-primary btn-sm">
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">密碼</h3>
                </div>
                <div class="box-body">
                    <div class="alert alert-success" style="display:none;margin-bottom:10px;" id="gen_pass"></div>
                    <div class="form-group no-margin-bottom">
                        <label for="password" class="control-label">密碼 <span class="field-optional"></span></label>
                        <div>
                            <input type="password" id="password" name="password" class="form-control form-autocomplete-stop">
                            <p class="text-muted small">留空以保持此使用者的密碼相同。如果更改密碼，使用者將不會收到任何通知.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">許可權</h3>
                </div>
                <div class="box-body">
                    <div class="form-group">
                        <label for="root_admin" class="control-label">系統管理員</label>
                        <div>
                            <select name="root_admin" class="form-control">
                                <option value="0">@lang('strings.no')</option>
                                <option value="1" {{ $user->root_admin ? 'selected="selected"' : '' }}>@lang('strings.yes')</option>
                            </select>
                            <p class="text-muted"><small>將此設置為“是”為用戶提供完全的管理存取權限.</small></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
    <div class="col-xs-12">
        <div class="box box-danger">
            <div class="box-header with-border">
                <h3 class="box-title">刪除此用戶</h3>
            </div>
            <div class="box-body">
                <p class="no-margin">必須沒有與此帳戶關聯的伺服器才能刪除此用戶.</p>
            </div>
            <div class="box-footer">
                <form action="{{ route('admin.users.view', $user->id) }}" method="POST">
                    {!! csrf_field() !!}
                    {!! method_field('DELETE') !!}
                    <input id="delete" type="submit" class="btn btn-sm btn-danger pull-right" {{ $user->servers->count() < 1 ?: 'disabled' }} value="刪除此用戶" />
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

