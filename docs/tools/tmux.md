# tmux

>prefix:  ctrl + b在配置已改成ctrl + f

## 回话存储

```shell
# 保存会话
prefix ctrl+s
# 恢复会话
prefix ctrl+r
```

## 常用命令

```sh
# 新建会话
tmux new -s windowName
# 查看会话
prefix s
# 重命名会话
prefix $

# 创建窗口
prefix c
# 切换到2号窗口
prefix 2
# 重命名窗口
prefix , 
# 关闭窗口
prefix &

# 水平拆分出一个新窗格
prefix %
# 垂直拆分窗格
prefix "
# 切换到下一个窗格
prefix o
# 关闭窗格
prefix x
```

## 会话管理

| 命令                | 说明                                     | 快捷键   |
| ------------------- | ---------------------------------------- | -------- |
| tmux new -s         | 创建会话                                 |          |
| tmux detach         | 退出当前会话，会话进程仍然在后台运行     | Ctrl+b d |
| tmux ls             | 查看当前所有的 会话                      | Ctrl+b s |
| tmux attach -t      | 重新接入某个已存在的会话                 |          |
| tmux kill-session   | 杀死某个会话                             |          |
| tmux switch -t      | 切换会话                                 |          |
| tmux rename-session | 重新命名会话                             | Ctrl+b $ |
| tmux at -d          | 重绘窗口，在不同屏幕上保持窗口为最小尺寸 |          |

## 窗口管理

窗口属于会话，窗口包含多个窗格

| 命令                  | 说明           | 快捷键   |
| --------------------- | -------------- | -------- |
| tmux new-window -n    | 创建新窗口     | Ctrl+b c |
| tmux select-window -t | 切换窗口       |          |
| tmux rename-window    | 重命名当前窗口 | Ctrl+b , |

切换窗口快捷键

| 快捷键   | 说明                                              |
| -------- | ------------------------------------------------- |
| Ctrl+b p | 切换到上一个窗口（按照状态栏上的顺序）            |
| Ctrl+b n | 切换到下一个窗口                                  |
| Ctrl+b   | 切换到指定编号的窗口，number 是状态栏上的窗口编号 |
| Ctrl+b w | 从列表中选择窗口                                  |
| ctrl+b & | 关闭当前窗口                                      |
| ctrl+b x | 删除窗口                                          |

## 窗格管理

**拆分窗格**

| 命令                 | 说明             |          |
| -------------------- | ---------------- | -------- |
| tmux split-window -h | 划分左右两个窗格 | prefix % |
| tmux split-window    | 划分上下两个窗格 | prefix " |

**移动窗格**

| 命令                | 说明               |
| ------------------- | ------------------ |
| tmux select-pane -U | 光标切换到上方窗格 |
| tmux select-pane -D | 光标切换到下方窗格 |
| tmux select-pane -L | 光标切换到左边窗格 |
| tmux select-pane -R | 光标切换到右边窗格 |
| tmux swap-pane -U   | 当前窗格上移       |
| tmux swap-pane -D   | 当前窗格下移       |

**窗格快捷键**

| 快捷键            | 说明                                       |
| ----------------- | ------------------------------------------ |
| Ctrl+b %          | 划分左右两个窗格                           |
| Ctrl+b "          | 划分上下两个窗格                           |
| Ctrl+b ;          | 切换到上一个窗格                           |
| Ctrl+b o          | 光标切换到下一个窗格                       |
| Ctrl+b {          | 当前窗格左移                               |
| Ctrl+b }          | 当前窗格右移                               |
| Ctrl+b Ctrl+o     | 当前窗格上移                               |
| Ctrl+b Alt+o      | 当前窗格下移                               |
| Ctrl+b x          | 关闭当前窗格                               |
| Ctrl+b !          | 将当前窗格拆分为一个独立窗口               |
| Ctrl+b z          | 当前窗格全屏显示，再使用一次会变回原来大小 |
| Ctrl+b q          | 显示窗格编号                               |
| Ctrl+b Alt+方向键 | 调整窗格大小                               |
|                   |                                            |

## 滚动窗口

tmux滚动窗口需要通过指令操作

| 快捷键                       | 说明     |
| ---------------------------- | -------- |
| Ctrl+b [ （按q退出滚动模式） | 滚动窗口 |

## 软件安装

### tmux下载

使用以下命令安装 tmux，linux与mac都可以使用[brew (opens new window)](http://houdunren.gitee.io/note/linux/2 常用工具.html#brew)进行安装

```sh
# Mac
$ brew install tmux

# CentOS 或 Fedor可以使用yum/dnf/brew等方式安装，brew版本更高些
$ yum install tmux
```

### 字体图标

执行以下指令安装字体图标到系统中，有些风格需要图标时就可以正常显示了

```sh
cd
git clone https://github.com/powerline/fonts.git --depth=1
cd fonts
./install.sh
cd ..
rm -rf fonts
```

> items2需要在perference => profile => text:
>
> :white_check_mark:  Use built-in Powerline glyphs    +  Font 选择

### 安装风格

1. Clone 项目代码

   ```sh
   git clone https://github.com/odedlaz/tmux-onedark-theme
   ```

2. 删除原~/.tmux.conf文件（注意不是删除内容，因为存在的.tmux.conf可能是软链接），然后新建配置文件 `~/.tmux.conf` 添加以下内容，如果想显示完整日期就将前2~4行注释掉。

   ```sh
   run-shell ~/tmux-onedark-theme/tmux-onedark-theme.tmux
   set -g @onedark_widgets " "
   set -g @onedark_time_format "%I:%M "
   set -g @onedark_date_format "%m/%d"
   set-option -g status-position bottom
   ```

3. 加载配置

   ```sh
   tmux source-file ~/.tmux.conf
   ```

## 总体配置

```sh
run-shell ~/tmux-onedark-theme/tmux-onedark-theme.tmux

#set -g @onedark_widgets"
set -g @onedark_widgets "Jerry Chen"
set -g @onedark_time_format "%I:%M"
set -g @onedark_date_format "%m:%d"
#set -g @onedark_date_format "%m:%d"
set-option -g default-terminal "screen-256color"
set -g default-terminal "screen-256color"

# 解决neovim中esc响应慢
set -s escape-time 0
set-option -g status-position bottom

# 自动保存会话
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @plugin 'tmux-plugins/tmux-continuum'​
set -g @continuum-save-interval '15'
set -g @continuum-restore 'on'
set -g @resurrect-capture-pane-contents 'on'
run '~/.tmux/plugins/tpm/tpm'

run-shell ~/.tmux/plugins/resurrect/resurrect.tmux

# 解除默认前缀
unbind C-b
# 设置自定义前缀
set -g prefix C-f
# 采用vim的操作方式
setw -g mode-keys vi
# 窗口序号从1开始计数
set -g base-index 1
# 开启鼠标模式
set-option -g mouse off

# 通过前缀+KJHL快速切换pane
#up
bind-key k select-pane -U
#down
bind-key j select-pane -D
#left
bind-key h select-pane -L
#right
bind-key l select-pane -R
```

