@extends('layouts.admin')

@section('title')
    管理
@endsection

@section('content-header')
    <h1>管理概况<small>快速瀏覽您的系統</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li class="active">首頁</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box
            @if($version->isLatestPanel())
                box-success
            @else
                box-danger
            @endif
        ">
            <div class="box-header with-border">
                <h3 class="box-title">系统訊息</h3>
            </div>
            <div class="box-body">

                    您正運行的 Pterodactyl-tw 面板版本為 <code>{{ config('app.version') }}</code>。請前往<a href="https://github.com/MagicTeaMC/pterodactyl-tw/releases">GitHub</a>查看是否有新版本

            </div>
        </div>
    </div>
</div>
<div class="row">
    <div class="col-xs-6 col-sm-3 text-center">
        <a href="https://discord.gg/uQ4UXANnP2"><button class="btn btn-warning" style="width:100%;"><i class="fa fa-fw fa-support"></i> 獲取幫助 <small>(Maoyue's Discord)</small></button></a>
    </div>
    <div class="col-xs-6 col-sm-3 text-center">
        <a href="https://pterodactyl.io/"><button class="btn btn-primary" style="width:100%;"><i class="fa fa-fw fa-link"></i> Pterodactyl文檔</button></a>
    </div>
    <div class="clearfix visible-xs-block">&nbsp;</div>
    <div class="col-xs-6 col-sm-3 text-center">
        <a href="https://github.com/MagicTeaMC/pterodactyl-tw"><button class="btn btn-primary" style="width:100%;"><i class="fa fa-fw fa-support"></i> Github</button></a>
    </div>
</div>
@endsection
