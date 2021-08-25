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
    navbar: [
      {
        text: 'JavaScript',
        children: [
          {
            text: '语法基础',
            children: [
              {
                text: '数组类型',
                link: '/javascript/array'
              },
              {
                text: 'Symbol类型',
                link: '/javascript/symbol'
              },
              {
                text: '函数进阶',
                link: '/javascript/function'
              },
              {
                text: "作用域与闭包",
                link: '/javascript/closure.md',
              },
              {
                text: '原型与继承',
                link: '/javascript/prototype'
              },
              {
                text: 'class',
                link: '/javascript/class'
              }
            ]
          }
        ]
      },
      {
        text: 'TypeScript',
        children: [
          {
            text: '语法基础',
            children: [
              {
                text: '基础语法',
                link: '/typescript/grammar/basic'
              },
              {
                text: '语法进阶',
                link: '/typescript/grammar/advanced'
              },
              {
                text: '高级语法',
                link: '/typescript/grammar/final'
              }
            ]
          },
          {
            text: '爬虫实现',
            children: [
              {
                text: '爬虫工具',
                link: '/typescript/crawler/basic'
              },
              {
                text: 'Express',
                link: '/typescript/crawler/express'
              },
              {
                text: '项目改良',
                link: '/typescript/crawler/final'
              }
            ]
          }
        ]
      },
      {
        text: '前端框架',
        children: [
          {
            text: 'Vue Js',
            children: [
              {
                text: 'Composition API',
                link: '/framework/vue/compositionApi'
              },
              {
                text: '基础语法',
                link: '/framework/vue/basic'
              },
              {
                text: '动画',
                link: '/framework/vue/animation'
              },
              {
                text: '高级语法',
                link: '/framework/vue/advanced'
              },
              {
                text: '日常笔记',
                link: '/framework/vue/vue'
              },
              {
                text: 'VueJs深入浅出',
                link: '/framework/vue/book'
              }
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
              }
            ]
          }
        ]
      },
      {
        text: '工具 | 协议',
        children: [
          {
            text: 'HTTP',
            link: '/tools/http'
          },
          {
            text: 'Git',
            link: '/tools/git'
          },
          {
            text: 'Webpack4.0',
            children: [
              {
                text: '基本概念',
                link: '/tools/webpack/basic'
              },
              {
                text: '起步介绍',
                link: '/tools/webpack/step-2'
              },
              {
                text: '打包配置',
                link: '/tools/webpack/step-3'
              },
              {
                text: '进阶',
                link: '/tools/webpack/step-4'
              },
              {
                text: '配置案例',
                link: '/tools/webpack/step-5'
              }
            ]
          }
        ]
      },
      { text: 'Github', link: 'https://github.com/caffreygo' },
      {
        text: 'Vue源码课程',
        link: 'https://ustbhuangyi.github.io/vue-analysis/v2/prepare/'
      }
    ],
    sidebar: {
      '/javascript/': [
        {
          text: '基础知识',
          children: [
            '/javascript/array.md',
            '/javascript/symbol.md',
            '/javascript/function.md',
            '/javascript/closure.md',
            '/javascript/prototype.md',
            '/javascript/class.md'
          ]
        }
      ],
      '/typescript/': [
        {
          text: '语法基础',
          children: [
            '/typescript/grammar/basic',
            '/typescript/grammar/advanced',
            '/typescript/grammar/final'
          ]
        },
        {
          text: '爬虫实现',
          children: [
            '/typescript/crawler/basic',
            '/typescript/crawler/express',
            '/typescript/crawler/final'
          ]
        }
      ],
      '/framework/vue/': [
        {
          text: 'Vue.js',
          children: [
            '/framework/vue/compositionApi',
            '/framework/vue/basic',
            '/framework/vue/animation',
            '/framework/vue/advanced',
            '/framework/vue/vue',
            '/framework/vue/book'
          ]
        }
      ],
      '/framework/react/': [
        {
          text: 'React.js',
          children: [
            '/framework/react/basic',
            '/framework/react/redux',
            '/framework/react/note'
          ]
        }
      ],
      '/tools/webpack/': [
        {
          text: 'Webpack',
          children: [
            '/tools/webpack/basic',
            '/tools/webpack/step-2',
            '/tools/webpack/step-3',
            '/tools/webpack/step-4',
            '/tools/webpack/step-5'
          ]
        }
      ],
      '/tools/': [
        {
          text: 'HTTP协议',
          children: ['/tools/http','/tools/git']
        },
      ]
    }
  }
}
