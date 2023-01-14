# 本地开发
翼龙现在由React、Typescript和Tailwindcss驱动，其核心是使用webpack来生成编译资源。
翼龙的发布版本将包括预编译、压缩和哈希的资源，你可以随时使用。

然而，如果你有兴趣运行自定义主题或对React文件进行修改，你将需要一个构建系统来生成这些编译资源。要设置好你的环境，你至少需要。

* [Node.js](https://nodejs.org/en/) v14.x.x
* [Yarn](https://classic.yarnpkg.com/lang/en/) v1.x.x
* [Go](https://golang.org/) 1.17.x

### 安装依赖项
```bash
yarn install
```

上面的命令将下载所有必要的依赖，以使翼龙资源构建。在这之后，它就像运行下面的命令一样简单，在你开发时生成资源。在你运行这个命令至少一次之前，你可能会在面板上看到一个500错误，即缺少`manifest.json`文件。这是由下面的命令生成的。

```bash
# 构建用于开发的编译资源集。
yarn run build

# 当资源被改变时自动构建。这使你可以刷新页面并立即看到变化。
yarn run watch
```

### 模块热加载
对于更高级的用户，我们还支持 '模块热重载'，让你快速查看你对 Vue 模板文件所做的修改，而不必重新加载你所在的页面。要使用它你只需要运行下面的命令。

```bash
PUBLIC_PATH=http://192.168.1.1:8080 yarn run serve --host 192.168.1.1
```

这个命令有两个非常重要的部分需要注意，并根据你的具体环境进行修改。第一个是 `--host` 参数，这是必须的，应该指向服务器将运行 `webpack-serve` 的机器。
第二个是 `PUBLIC_PATH` 环境变量，它是指向 HMR 服务器的 URL，并被附加到翼龙中使用的所有资源 URL 上。

#### 开发环境
如果你使用 [`pterodactyl-china/development`](https://github.com/pterodactyl-china/development) 环境，强烈推荐你可以直接运行 `yarn run serve` 来运行 HMR 服务器，它不需要额外配置。

### 为生产环境构建
一旦你有了你的文件，并准备好上线服务器，你将需要生成预编译、压缩和哈希的资源来推送上线。要做到这一点，请运行下面的命令。

```bash
yarn run build:production
```

这将生成一个生产 JS 包和相关资源，都位于 `public/assets/` 中，需要上传到你的服务器或CDN供客户使用。

### 运行 Wings
要在开发中运行 `wings`，你需要做的就是在添加新节点时正常设置配置文件，然后你可以通过在 Wings 代码目录中执行 `make debug` 来构建和运行本地版本的 Wings。这必须在某些 Linux 虚拟机上运行，你不能在 MacOS 或 Windows 上本地运行。
