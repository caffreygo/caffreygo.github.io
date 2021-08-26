const CONFIG = require("./util")

module.exports = {
  lang: 'zh-CN',
  title: 'Jerry Chen',
  description: '在线文档',
  base: '/',
  head: [['link', { rel: 'icon', href: '/icon.png' }]],
  port: 3000,
  markdown: {
    lineNumbers: false
  },
  themeConfig: {
    sidebar: 'auto',
    lastUpdatedText: '上次更新',
    contributorsText: '贡献者',
    tip: '提示',
    warning: '注意',
    danger: '警告',
    backToHome: '返回首页',
    openInNewWindow: '在新窗口打开',
    toggleDarkMode: '切换夜间模式',
    toggleSidebar: '切换侧边栏',
    notFound: [
      '这里什么都没有',
      '我们怎么到这来了？',
      '这是一个 404 页面',
      '看起来我们进入了错误的链接'
    ],
    navbar: CONFIG.navbar,
    sidebar: CONFIG.sidebar
  }
}
