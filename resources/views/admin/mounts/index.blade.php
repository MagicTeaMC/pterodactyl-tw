@extends('layouts.admin')

@section('title')
    掛載點
@endsection

@section('content-header')
    <h1>掛載點<small>配置並管理伺服器的額外掛載點。</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理員</a></li>
        <li class="active">掛載點</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        <div class="col-xs-12">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">掛載點列表</h3>

                    <div class="box-tools">
                        <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#newMountModal">新增掛載點</button>
                    </div>
                </div>

                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <tbody>
                            <tr>
                                <th>ID</th>
                                <th>名稱</th>
                                <th>來源</th>
                                <th>目標</th>
                                <th class="text-center">Eggs</th>
                                <th class="text-center">節點</th>
                                <th class="text-center">伺服器</th>
                            </tr>

                            @foreach ($mounts as $mount)
                                <tr>
                                    <td><code>{{ $mount->id }}</code></td>
                                    <td><a href="{{ route('admin.mounts.view', $mount->id) }}">{{ $mount->name }}</a></td>
                                    <td><code>{{ $mount->source }}</code></td>
                                    <td><code>{{ $mount->target }}</code></td>
                                    <td class="text-center">{{ $mount->eggs_count }}</td>
                                    <td class="text-center">{{ $mount->nodes_count }}</td>
                                    <td class="text-center">{{ $mount->servers_count }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="newMountModal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <form action="{{ route('admin.mounts') }}" method="POST">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="關閉">
                            <span aria-hidden="true" style="color: #FFFFFF">&times;</span>
                        </button>

                        <h4 class="modal-title">建立掛載點</h4>
                    </div>

                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-12">
                                <label for="pName" class="form-label">名稱</label>
                                <input type="text" id="pName" name="name" class="form-control" />
                                <p class="text-muted small">用於區分此掛載點的唯一名稱。</p>
                            </div>

                            <div class="col-md-12">
                                <label for="pDescription" class="form-label">描述</label>
                                <textarea id="pDescription" name="description" class="form-control" rows="4"></textarea>
                                <p class="text-muted small">此掛載點的詳細描述，不能超過 191 個字元。</p>
                            </div>

                            <div class="col-md-6">
                                <label for="pSource" class="form-label">來源</label>
                                <input type="text" id="pSource" name="source" class="form-control" />
                                <p class="text-muted small">主機系統上的檔案路徑，將掛載到容器中。</p>
                            </div>

                            <div class="col-md-6">
                                <label for="pTarget" class="form-label">目標</label>
                                <input type="text" id="pTarget" name="target" class="form-control" />
                                <p class="text-muted small">掛載點在容器內的存取位置。</p>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label">唯讀</label>

                                <div>
                                    <div class="radio radio-success radio-inline">
                                        <input type="radio" id="pReadOnlyFalse" name="read_only" value="0" checked>
                                        <label for="pReadOnlyFalse">否</label>
                                    </div>

                                    <div class="radio radio-warning radio-inline">
                                        <input type="radio" id="pReadOnly" name="read_only" value="1">
                                        <label for="pReadOnly">是</label>
                                    </div>
                                </div>

                                <p class="text-muted small">此掛載點在容器內是否為唯讀？</p>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label">使用者可掛載</label>

                                <div>
                                    <div class="radio radio-success radio-inline">
                                        <input type="radio" id="pUserMountableFalse" name="user_mountable" value="0" checked>
                                        <label for="pUserMountableFalse">否</label>
                                    </div>

                                    <div class="radio radio-warning radio-inline">
                                        <input type="radio" id="pUserMountable" name="user_mountable" value="1">
                                        <label for="pUserMountable">是</label>
                                    </div>
                                </div>

                                <p class="text-muted small">使用者是否可以自行掛載此掛載點？</p>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        {!! csrf_field() !!}
                        <button type="button" class="btn btn-default btn-sm pull-left" data-dismiss="modal">取消</button>
                        <button type="submit" class="btn btn-success btn-sm">建立</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection
