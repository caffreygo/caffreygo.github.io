module.exports = {
  lang: 'zh-CN',
  title: 'Jerry Chen',
  description: '在线文档',
  base: '/',
  head: [
    ['link', { rel: 'icon', href: '/icon.png' }]
  ],
  port: 3000,
  markdown: {
    lineNumbers: false
  },
  themeConfig: {
    sidebar: 'auto',
    lastUpdated: '最后更新时间',
    navbar: [
      {
        text: '工具软件',
        children: [
          {
            text: 'Git',
            link: '/tools/git'
          },
        ]
      },
      {
        text: '前端框架',
        children: [
          {
            text: 'Vue Js',
            children: [
              {
                text: 'React基础',
                link: '/framework/react/basic'
              },
            ]
          },
          {
            text: 'React Js',
            children: [
              {
                text: 'React基础',
                link: '/framework/react/basic'
              },
              {
                text: 'Redux',
                link: '/framework/react/redux'
              },
              {
                text: '笔记',
                link: '/framework/react/note'
              },
            ]
          },
        ]
      },
    ]
  },
  
}