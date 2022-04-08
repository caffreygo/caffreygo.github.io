# 表单与列表

## 表单

表单是服务器收集用户数据的方式。

### FORM

一般情况下表单项要放在 FORM 内提交。

```html
<form action="form.php" method="POST">
	<fieldset>
		<legend>测试</legend>
		<input type="text">
	</fieldset>
</form>
```

| 属性   | 说明                 |
| ------ | -------------------- |
| action | 后台地址             |
| method | 提交方式 GET 或 POST |

### LABEL

📗 使用 `label` 用于描述表单标题，当点击标题后文本框会获得焦点，需要保证使用的ID在页面中是唯一的。

将一个 `<label>` 和一个 `<input>` 元素匹配在一起，你需要给 `<input>` 一个 `id` 属性。而 `<label>` 需要一个 `for` 属性，其值和  `<input>` 的 `id` 一样。

```html
<form action="form.php" method="POST" novalidate>
    <label for="title">标题</label>
    <input type="text" name="title" id="title">
</form>
```

> 也可以将文本框放在 `label` 标签内部，这样就不需要设置 id 与 for 属性了

```html
<form action="form.php" method="POST" novalidate>
    <label>标题
        <input type="text" name="title">
    </label>
</form>
```

### INPUT

文本框用于输入单行文本使用，下面是常用属性与示例。

| 属性        | 说明                                                         |
| ----------- | ------------------------------------------------------------ |
| type        | 表单类型默认为 `text`                                        |
| name        | 后台接收字段名                                               |
| required    | 必须输入                                                     |
| placeholder | 提示文本内容                                                 |
| value       | 默认值                                                       |
| maxlength   | 允许最大输入字符数                                           |
| size        | 表单显示长度，一般用不使用而用 `css` 控制                    |
| disabled    | 禁止使用，不可以提交到后台                                   |
| readonly    | 只读，可提交到后台                                           |
| capture     | 使用麦克风、视频或摄像头哪种方式获取手机上传文件，支持的值有 microphone, video, camera |

**基本示例**

```html
<form action="form.php" method="POST" novalidate>
    <fieldset>
        <legend>文本框</legend>
        <input type="text" name="title" required placeholder="请输入标题" maxlength="5" value="" size="100">
    </fieldset>
</form>
```

**调取摄像头**

📌 当input类型为file时手机会让用户选择图片或者拍照，如果想直接调取摄像头使用以下代码。

```html
<input type="file" capture="camera" accept="image/*" />
```

其他类型

通过设置表单的 `type` 字段可以指定不同的输入内容。

| 类型     | 说明                         |
| -------- | ---------------------------- |
| email    | 输入内容为邮箱               |
| url      | 输入内容为URL地址            |
| password | 输入内容为密码项             |
| tel      | 电话号，移动端会调出数字键盘 |
| search   | 搜索框                       |
| hidden   | 隐藏表单                     |
| submit   | 提交表单                     |

### HIDDEN

📗 隐藏表单用于提交后台数据，但在前台内容不显示所以在其上做用样式定义也没有意义。

```html
<input type="hidden" name="id" value="1">
```

### 提交表单

📗创建提交按钮可以将表单数据提交到后台，有多种方式可以提交数据如使用AJAX，或HTML的表单按钮。

1. 使用input构建提交按钮，如果设置了name值按钮数据也会提交到后台，如果有多个表单项可以通过些判断是哪个表单提交的。（name属性可以告诉后台提交的按钮名字，以确认类型）

   ```html
   <input type="submit" name="submit" value="提交表单">
   ```

2. 使用button也可以提交，设置type属性为`submit` 或**不设置**都可以提交表单。

   ```html
   <button type="submit">提交表单</button>
   ```

### 禁用表单

📗 通过为表单设置 `disabled` 或 `readonly` 都可以禁止修改表单，但 `readonly`表单的数据可以提交到后台。

```html
<input type="text" name="web" value="google.com" readonly>
```

### PATTERN

📗 表单可以通过设置 `pattern` 属性指定正则验证，也可以使用各种前端验证库如 [formvalidator (opens new window)](http://www.formvalidator.net/#default-validators_custom)或 [validator.js (opens new window)](https://github.com/validatorjs/validator.js)。

| 属性      | 说明                               |
| --------- | ---------------------------------- |
| pattern   | 正则表达式验证规则                 |
| oninvalid | 输入错误时触发的事件（提交时触发） |

```html
<form action="">
    <input type="text" name="username" pattern="[A-z]{5,20}" 
           oninvalid="validate('请输入5~20位字母的用户名')">
    <button>提交</button>
</form>

<script>
    function validate(message) {
        alert(message);
    }
</script>
```

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/form/1.jpg)

### TEXTAREA

📗 文本域指可以输入多行文本的表单，当然更复杂的情况可以使用编辑器如`ueditor、ckeditor`等。

| 选项 | 说明                            |
| ---- | ------------------------------- |
| cols | 列字符数（一般使用css控制更好） |
| rows | 行数（一般使用css控制更好）     |

```html
<textarea name="content" cols="30" rows="3">content</textarea>
```

### SELECT

下拉列表项可用于多个值中的选择。

| 选项     | 说明       |
| -------- | ---------- |
| multiple | 支持多选   |
| size     | 列表框高度 |
| optgroup | 选项组     |
| selected | 选中状态   |
| option   | 选项值     |

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/form/2.jpg)

```html
<form action="">
    <select name="lesson">
        <option value="">== 选择课程 ==</option>
        <optgroup label="后台">
            <option value="php">PHP</option>
            <option value="linux">LINUX</option>
            <option value="mysql">MYSQL</option>
        </optgroup>
        <optgroup label="前台">
            <option value="php">HTML</option>
            <option value="linux">JAVASCRIPT</option>
            <option value="mysql">CSS</option>
        </optgroup>
    </select>
    <button>提交</button>
</form>
```

select支持多选，并且可以通过size调整数量。

```html
<form action="">
    <select name="lesson[]" multiple="multiple" size="2">
        <option value="volvo">Volvo</option>
        <option value="saab">Saab</option>
        <option value="opel">Opel</option>
        <option value="audi">Audi</option>
    </select>
    <button>提交</button>
</form>
```

### RADIO

单选框指只能选择一个选项的表单，如性别的选择`男、女、保密` 只能选择一个。

| 选项    | 说明     |
| ------- | -------- |
| checked | 选中状态 |

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/form/3.png)

```html
<input type="radio" name="sex" value="boy" id="boy">
<label for="boy">男</label>

<input type="radio" name="sex" value="girl" id="girl" checked>
<label for="girl">女</label>
```

### CHECKBOX

复选框指允许选择多个值的表单。

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/form/4.png)

```html
<fieldset>
        <legend>复选框</legend>
        <input type="checkbox" name="sex" value="boy" id="boy">
        <label for="boy">PHP</label>

        <input type="checkbox" name="sex" value="girl" id="girl" checked>
        <label for="girl">MYSQL</label>
</fieldset>
```

### 文件上传

📗 文件上传有多种方式，可以使用插件或JS拖放上传处理。HTML本身也提供了默认上传的功能，只是上传效果并不是很美观。文件上传需要设置`enctype`为`multipart/form-data`

| 选项     | 说明                                              |
| -------- | ------------------------------------------------- |
| multiple | 支持多选                                          |
| accept   | 允许上传类型 `.png,.psd` 或 `image/png,image/gif` |

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/form/5.png)

```html
<form action="" method="POST" enctype="multipart/form-data">
	<fieldset>
		<input type="file" name="icon" multiple="multiple" accept="image/png,image/gif">
	</fieldset>
	<button>保存</button>
</form>
```

### multipart/form-data

#### 表单enctype

- application/x-www-urlencoded
- multipart/form-data
- text-plain

📗 默认情况下是 `application/x-www-urlencoded`，当表单使用 POST 请求时，数据会被以 `x-www-urlencoded` 方式编码到 Body 中来传送，而如果 GET 请求，则是附在 url 链接后面来发送。GET 请求只支持 ASCII 字符集，因此，如果我们要发送更大字符集的内容，我们应使用 POST 请求。

📌 `"application/x-www-form-urlencoded"` 编码的格式是 ASCII，如果 form 中传递的是二进制等 Media Type 类型的数据，那么 `application/x-www-form-urlencoded` 会把其编码转换成 ASCII 类型。对于 1 个 non-ASCII 字符，它需要用 3 个 ASCII字符来表示，如果要发送大量的二进制数据（non-ASCII），`"application/x-www-form-urlencoded"` 显然是低效的。因此，这种情况下，应该使用 `"multipart/form-data"` 格式。

#### application/x-www-urlencoded

我们在通过 HTTP 向服务器发送 POST 请求提交数据，都是通过 form 表单形式提交的，代码如下：

```html
<form method="post" action="" >
    <input type="text" name="txt1">
    <input type="text" name="txt2">
 </form>
```

提交时会向服务器端发出这样的数据（已经去除部分不相关的头信息），数据如下：

```shell
POST / HTTP/1.1
Content-Type:application/x-www-form-urlencoded
Accept-Encoding: gzip, deflate
Host: w.sohu.com
Content-Length: 21
Connection: Keep-Alive
Cache-Control: no-cache
 
txt1=hello&txt2=world
```

对于普通的 HTML Form POST请求，它会在头信息里使用 `Content-Length` 注明内容长度。
 请求头信息每行一条，空行之后便是 Body，即“内容”（entity）。内容的格式是在头信息中的 Content-Type 指定的，如上是 `application/x-www-form-urlencoded`，这意味着消息内容会经过 URL 格式编码，就像在 GET请 求时 URL 里的 QueryString 那样。`txt1=hello&txt2=world`

#### multipart/form-data

📗  `multipart/form-data` 定义在 [rfc2388](https://links.jianshu.com/go?to=https%3A%2F%2Ftools.ietf.org%2Fhtml%2Frfc2388) 中，最早的 HTTP POST 是不支持文件上传的，给编程开发带来很多问题。但是在1995年，ietf 出台了 rfc1867，也就是《RFC 1867 -Form-based File Upload in HTML》，用以支持文件上传。所以 Content-Type 的类型扩充了multipart/form-data 用以支持向服务器发送二进制数据。因此，发送 POST 请求时候，表单 `<form> `属性 enctype 共有二个值可选，这个属性管理的是表单的 MIME 编码：

① application/x-www-form-urlencoded (默认值)
② multipart/form-data

> form 表单中 enctype 的默认值是 `enctype="application/x- www-form-urlencoded"`

通过 form 表单提交文件操作如下：

```shell
<FORM method="POST" action="" enctype="multipart/form-data">
    <INPUT type="text" name="city" value="Santa colo">
    <INPUT type="text" name="desc">
    <INPUT type="file" name="pic">
 </FORM>
```

浏览器将会发送以下数据：

```shell
POST /t2/upload.do HTTP/1.1
User-Agent: SOHUWapRebot
Accept-Language: zh-cn,zh;q=0.5
Accept-Charset: GBK,utf-8;q=0.7,*;q=0.7
Connection: keep-alive
Content-Length: 60408
Content-Type:multipart/form-data; boundary=ZnGpDtePMx0KrHh_G0X99Yef9r8JZsRJSXC
Host: w.sohu.com

--ZnGpDtePMx0KrHh_G0X99Yef9r8JZsRJSXC
Content-Disposition: form-data; name="city"

Santa colo
--ZnGpDtePMx0KrHh_G0X99Yef9r8JZsRJSXC
Content-Disposition: form-data;name="desc"
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
 
...
--ZnGpDtePMx0KrHh_G0X99Yef9r8JZsRJSXC
Content-Disposition: form-data;name="pic"; filename="photo.jpg"
Content-Type: application/octet-stream
Content-Transfer-Encoding: binary
 
... binary data of the jpg ...
--ZnGpDtePMx0KrHh_G0X99Yef9r8JZsRJSXC--
```

📌 从上面的 `multipart/form-data` 格式发送的请求的样式来看，它包含了多个 Parts，每个 Part 都包含头信息部分，Part 头信息中必须包含一个 `Content-Disposition` 头，其他的头信息则为可选项， 比如 `Content-Type` 等。

**`Content-Disposition`** 包含了 type 和 一个名字为 name 的 parameter，type 是 form-data，name 参数的值则为表单控件（也即 field）的名字，如果是文件，那么还有一个 filename 参数，值就是文件名。

比如：

```kotlin
Content-Disposition: form-data; name="user"; filename="hello.txt"
```

💡 上面的 "user" 就是表单中的控件的名字，后面的参数 filename 则是点选的文件名。
 对于可选的 Content-Type（如果没有的话），默认就是 `text/plain`。

📗 如果文件内容是通过填充表单来获得，那么上传的时候，Content-Type 会被自动设置（识别）成相应的格式，如果没法识别，那么就会被设置成 `"application/octet-stream"`
 如果多个文件被填充成单个表单项，那么它们的请求格式则会是 multipart/mixed。

如果 Part 的内容跟默认的 encoding 方式不同，那么会有一个 `"content-transfer-encoding"` 头信息来指定。

下面，我们填充两个文件到一个表单项中，行程的请求信息如下：

```shell
Content-Type: multipart/form-data; boundary=AaB03x

--AaB03x
Content-Disposition: form-data; name="submit-name"

Larry
--AaB03x
Content-Disposition: form-data; name="files"
Content-Type: multipart/mixed; boundary=BbC04y

--BbC04y
Content-Disposition: file; filename="file1.txt"
Content-Type: text/plain

... contents of file1.txt ...
--BbC04y
Content-Disposition: file; filename="file2.gif"
Content-Type: image/gif
Content-Transfer-Encoding: binary

...contents of file2.gif...
--BbC04y--
--AaB03x--
```

#### Boundary 分隔符

每个部分使用 `--boundary` 分割开来，最后一行使用 `--boundary--` 结尾。

```html
<FORM action="http://localhost:8000" method="post" enctype="multipart/form-data">
    <p><INPUT type="text" name="text" value="text default">
    <p><INPUT type="file" name="file1">
    <p><INPUT type="file" name="file2">
    <p><BUTTON type="submit">Submit</BUTTON>
</FORM>
```

```shell
POST / HTTP/1.1
Host: localhost:8000
User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:29.0) Gecko/20100101 Firefox/29.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Cookie: __atuvc=34%7C7; permanent=0; _gitlab_session=226ad8a0be43681acf38c2fab9497240; __profilin=p%3Dt; request_method=GET
Connection: keep-alive
Content-Type: multipart/form-data; boundary=---------------------------9051914041544843365972754266
Content-Length: 554

-----------------------------9051914041544843365972754266
Content-Disposition: form-data; name="text"

text default
-----------------------------9051914041544843365972754266
Content-Disposition: form-data; name="file1"; filename="a.txt"
Content-Type: text/plain

Content of a.txt.

-----------------------------9051914041544843365972754266
Content-Disposition: form-data; name="file2"; filename="a.html"
Content-Type: text/html

<!DOCTYPE html><title>Content of a.html.</title>

-----------------------------9051914041544843365972754266--
```

### 日期与时间

| 属性 | 说明                                                |
| ---- | --------------------------------------------------- |
| step | 间隔：date 缺省是1天，week缺省是1周，month缺省是1月 |
| min  | 最小时间                                            |
| max  | 最大时间                                            |

**日期选择**

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/form/6.png)

```html
<input type="date" step="5" min="2020-09-22" max="2025-01-15" name="datetime">
```

**周选择**

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/form/7.png)

```html
<input type="week">
```

**月份选择**

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/form/8.png)

```html
<input type="month">
```

**日期与时间**

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/form/9.png)

```html
<input type="datetime-local" name="datetime">
```

### DATALIST

input表单的输入值选项列表

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/form/10.png)

```html
<form action="" method="post">
    <input type="text" list="lesson">
    <datalist id="lesson">
        <option value="PHP">后台管理语言</option>
        <option value="CSS">美化网站页面</option>
        <option value="MYSQL">掌握数据库使用</option>
    </datalist>
</form>
```

### autocomplete

浏览器基于之前键入过的值，应该显示出在字段中填写的选项。

```html
<form action="">
    <input type="search" autocomplete="on" name="content" />
    <button>提交</button>
</form>
```

## 列表

列表的使用与`word` 等软件的列表概念相似，只不过是应用在网页展示中。

### 有序列表

📗 有序列表是指有数字编号的列表项，可以使用`CSS`定义更多样式，具体请查看CSS章节。

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/form/12.png)

```html
<ol>
    <li>google.com</li>
    <li>baidu.com</li>
    <li>emoji.com</li>
</ol>
```

### 无序列表

📗 没有数字编号的列表项，可以使用`CSS`定义更多样式。

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/form/11.png)

```html
<ul>
    <li>google.com</li>
    <li>baidu.com</li>
    <li>emoji.com</li>
</ul>
```

### 描述列表

描述列表指每个列表项有单独的标题。

![](http://ra15bg9hk.hn-bkt.clouddn.com/html/form/13.png)

```html
<dl>
    <dt>网址</dt>
    <dd>baidu.com</dd>
    <dd>emoji.com</dd>

    <dt>前端</dt>
    <dd>css</dd>
    <dd>html</dd>
</dl>
```

###  