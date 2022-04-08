# React

## this

### 官方

```js
class Toggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isToggleOn: true };

    // 为了在回调中使用 `this`，这个绑定是必不可少的
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState((state) => ({
      isToggleOn: !state.isToggleOn,
    }));
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.isToggleOn ? 'ON' : 'OFF'}
      </button>
    );
  }
}

ReactDOM.render(<Toggle />, document.getElementById('root'));
```

你必须谨慎对待 JSX 回调函数中的 `this`，在 JavaScript 中，class 的方法默认不会绑定 `this`。如果你忘记绑定 `this.handleClick` 并把它传入了 `onClick`，当你调用这个函数的时候 `this` 的值为 `undefined`。

这并不是 React 特有的行为；这其实与 JavaScript 函数工作原理有关。通常情况下，如果你没有在方法后面添加 `()`，例如 `onClick={this.handleClick}`，你应该为这个方法绑定 `this`。

### 理解

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script>
      function handleClick() {
        console.log(this); // window
      }
    </script>
  </head>
  <body>
    <button onclick="handleClick()">按钮</button>
  </body>
</html>
```

::: tip this

 JSX 语法中的 this 指向当前组件

:::

- JSX 中的 this 执行当前 Reack 组件,所以 onClick = { this.handleClick }可以拿到当前组件的函数

- class 定义中，当定义 React 组件时，`extends React.Component`时，不会将`this`继承下来。所以 handClick 函数中如果使用`this`是`undefined`。 以下两种方式可以指定`this`:

  1. `this.handleClick = this.handleClick.bind(this)` ，推荐这种在构造函数绑定的方式
  2. `<button onClick={this.handleClick.bind(this)}></button>`

- ES6 中的 arrow function，默认在定义的时候会绑定`this`, 指向了当前事件触发的上下文

  `<div onScroll={ ()=> {this.scroll() } } className="field-wrap"></div>`

## 基础

### PWA

::: tip progressive web application

在 https 协议的服务器上，在用户二次访问网页的，即使是断网也能够访问，serviceWorker 能够缓存网页

:::

::: tip mainfest.json

如果配置了 pwa 设置，那么便可以把网页创建一个桌面快捷方式进行访问

:::

icons src 设置了桌面快捷图标的 icon

```json
{
  "short_name": "React App",
  "name": "Create React App Sample",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

### class component

render 函数返回 JSX

```js
import React, { Component } from 'react';

class App extends Component {
  render() {
    return <div>hello world..</div>;
  }
}
export default App;
```

### ReactDOM.render

- ReactDOM 的 render 方法能够实现将一个 React 组件挂载到 DOM 节点上
- ReactDOM 展示组件内容的时候，`<App />`使用了 JSX 语法，必需引入 React，才能进行编译

```js
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

ReactDOM.render(
  // JSX
  <App />,
  document.getElementById('root')
);
```

### JSX 语法

- JSX 语法直接写标签，不需要引号包裹

  ```jsx
  render() {
      return <div>hello world..</div>
  }
  ```

- JSX 语法中的标签不仅可以是**原生标签**，也可以使用**组件**，组件开头必需**大写字母**开头`<App />`，Fragment 也是一个组件

  ```jsx
  import App from './App'; // 大写字母开头
  ReactDOM.render(<App />, document.getElementById('root'));
  ```

* JSX 注释

  ```jsx
  {
    /* 开发模式下的注释，不会显示在页面上 */
  }
  ```

  ```jsx
  {
    //单行注释要把花括号单独放一行
  }
  ```

* 引入和添加 class, for 等属性

  ::: tip 关键字

   class 使用 className, for 使用 htmlFor

  :::

  ```js
  import './style.css';
  ```

  ```jsx
  <label htmlFor="insertArea">输入内容</label>
  <input
      id="insertArea"
      className="input"
      value={this.state.inputValue}
      onChange={this.handleInputChange.bind(this)}
  />
  ```

* innerHtml

  外层花括号表示 JSX 语法，内层花括号表示接受一个对象

  ```jsx
  <li
    key={index}
    onClick={this.handleItemDelete.bind(this, index)}
    dangerouslySetInnerHTML={{ __html: item }}
  ></li>
  ```

### immutable

::: tip immutable

 react 建议 state 不允许我们做任何的改变（直接改变会影响性能）

 可以考虑拷贝一个副本, 然后操作赋值 [...this.state.list] ）

:::

```js
  handleItemDelete(index) {
    const list = [...this.state.list]  // 拷贝
    list.splice(index, 1)
    this.setState({
      list: list
    })
  }
```

### 拆分组件和组件传值

::: tip 组件

 在 constructor 里面做 this 统一绑定，会比在 jsx 中绑定的性能好

 父组件通过属性向子组件传值，子组件通过 props 接收

 子组件通过属性获取父组件方法，调用向外传递事件（父组件在传递方法时, 要记得绑定父组件的 this）

 setState 可以传递一个函数实现异步，并且带来性能提升，函数参数 prevState(修改之前的 state)

:::

```jsx
// TodoList.js
import React, { Component, Fragment } from 'react';
import './style.css';
import TodoItem from './TodoItem';

class TodoList extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleBtnClick = this.handleBtnClick.bind(this);
    this.handleItemDelete = this.handleItemDelete.bind(this);
    this.state = {
      inputValue: '',
      list: [],
    };
  }

  render() {
    return (
      <Fragment>
        <div>
          <label htmlFor="insertArea">输入内容</label>
          <input
            id="insertArea"
            className="input"
            value={this.state.inputValue}
            onChange={this.handleInputChange}
          />
          <button onClick={this.handleBtnClick}>提交</button>
        </div>
        <ul>{this.getTodoItem()}</ul>
      </Fragment>
    );
  }

  getTodoItem() {
    return this.state.list.map((item, index) => {
      return (
        <TodoItem
          content={item}
          key={index}
          index={index}
          deleteItem={this.handleItemDelete}
        />
      );
    });
  }

  handleInputChange(e) {
    const value = e.target.value;
    this.setState(() => ({
      inputValue: value,
    }));
  }

  handleBtnClick() {
    if (this.state.inputValue.trim().length === 0) return;
    this.setState((prevState) => ({
      list: [...prevState.list, prevState.inputValue],
      inputValue: '',
    }));
  }

  handleItemDelete(index) {
    this.setState((prevState) => {
      const list = [...prevState.list];
      list.splice(index, 1);
      return { list };
    });
  }
}

export default TodoList;
```

```jsx
// TodoItem.js
import React, { Component } from 'react';

class TodoItem extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  render() {
    const { content } = this.props;
    return <li onClick={this.handleClick}>{content}</li>;
  }

  handleClick() {
    const { deleteItem, index } = this.props;
    deleteItem(index);
  }
}

export default TodoItem;
```

### 总结

::: tip 思考

- 命名式开发: 直接操作 dom（jQuery、原生），声名式开发: 面向数据编程（React）

- 可以与其它框架并存，React 只影响其绑定的原生 dom 标签下的区域

- 组件化（React 的组件首字母大写，属性传值，方法传递）

- 单向数据流，子组件不允许改变父组件的值（只读，当数据被多个子组件共用且允许被子组件改变数据时，会导致维护困难）
- 视图层框架（需要 redux 等其它辅助状态管理）
- 函数式编程（有利于单元测试）

:::

## 进阶

### PropTypes 与 DefaultProps

- 使用

  [PropTypes]: https://reactjs.org/docs/typechecking-with-proptypes.html

  实现**类型校验**(开发环境下的 warning)

```js
import React, { Component } from 'react'
import PropTypes from 'prop-types'

class TodoItem extends Component {
    // ...
}

TodoItem.propTypes = {
    content: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    deleteItem: PropTypes.func
    index: PropTypes.number
}

export default TodoItem
```

isRequired 实现必传`test: PropTypes.string.isRequired`

```sh
Warning: Failed prop type: The prop `test` is marked as required in `TodoItem`, but its value is `undefined`.
```

- 使用 defaultProps**提供默认值**(例如在 isRequired 下)

```js
TodoItem.defaultProps = {
  test: 'hello world',
};
```

### Props、State 与 render 函数

- 当组件当中的 Props 或者 State 发生改变的时候，会触发 render 函数重新执行
- 当父组件的 render 函数被运行时，它的子组件的 render 都将被重新执行

### 什么是虚拟 DOM

#### 方案 1

1. state 数据
2. 模板 （render 函数中返回的 JSX）
3. 数据 + 模板 = 真实的 DOM 显示
4. state 发生改变
5. 数据 + 模板 = 真实的 DOM，替换原始的 DOM

::: warning 缺陷

- 第一次生成了一个完整的 DOM 片段
- 第二次生成了一个完整的 DOM 片段
- 第二次生成的 DOM 替换第一次的 DOM，非常耗性能

:::

#### 方案 2

1. state 数据
2. JSX 模板
3. 数据 + 模板 结合，生成真实的 DOM，来显示
4. state 发生改变
5. 数据 + 模板 结合，生成真实的 DOM，并不直接替换原始的 DOM
6. 新的 DOM（DocumentFragment 文档碎片）和原始的 DOM 做对比，找差异、
7. 找出 input 框发生了变化
8. 只用新的 DOM 中的 input 元素，替换掉老的 DOM 中的 input 元素

::: tip 结果

- 只修改部分 DOM 元素节约了一部分性能
- 对比 DOM 的过程又损耗了一部分性能
- 性能提升并不明显

:::

#### 方案 3

1. state 数据

2. JSX 模板

3. 数据 + 模板 结合，生成真实的 DOM，来显示

   `<div id='abc'><span>hello world</span></div>`

4. 生成虚拟 DOM（虚拟 DOM 是一个数组结构的对象，用它开描述真实 DOM）

   `['div',{id:'abc'},['span',{},'hello world']]`

5. state 发生变化

6. 生成新的虚拟 DOM

   `['div',{id:'abc'},['span',{},'bye bye']]`

7. 比较原始虚拟 DOM 和新的虚拟 DOM 的区别，找到区别是 span 中的内容

8. 直接操作 DOM，改变 span 中的内容

::: tip 优化

- 第 4 步，生成虚拟 DOM 损耗了一些性能，但是生成 JS 对象的虚拟 DOM 与生成真实 DOM 的损耗相比是很小的（js 创建 js 对象很简单，创建 DOM 的时候需要调用 WebApplication 级别的 API 的损耗就比较大）
- 第 6 步生成虚拟 DOM 对比方案 2 第 5 步生成 DOM 极大提升了性能
- 第 7 步比较 JS 对象，和真实 DOM 的对比也极大提升了性能

:::

### 虚拟 DOM 深入

- react 的实现是在生成虚拟 DOM 后才生成真实 DOM

- JSX => createElement => 虚拟 DOM（JS 对象） => 真实的 DOM

  ```jsx
  render() {
  	return (
      	<div>item</div>
      )
      // return React.createElement('div', {}, 'item')
  }
  ```

1. state 数据

2. JSX 模板

3. 生成虚拟 DOM（虚拟 DOM 是一个数组结构的对象，用它开描述真实 DOM）

   `['div',{id:'abc'},['span',{},'hello world']]`

4. 通过虚拟 DOM 来生成真实的 DOM，来显示

   `<div id='abc'><span>hello world</span></div>`

5. state 发生变化

6. 生成新的虚拟 DOM

   `['div',{id:'abc'},['span',{},'bye bye']]`

7. 比较原始虚拟 DOM 和新的虚拟 DOM 的区别，找到区别是 span 中的内容

8. 直接操作 DOM，改变 span 中的内容

::: tip 虚拟 DOM 的优点

- 性能提升

- 跨端应用得以实现。React Native

  DOM 只存在于浏览器，虚拟 DOM 作为 JS 对象在原生应用和浏览器都可以复用

:::

### 虚拟 DOM 中的 diff 算法

比较虚拟 DOM 区别的算法（第 7 步）

- setState 作为异步函数提供了多个 state 更新（很短间隔时间内）只执行一次 setState，一次虚拟 DOM 的比对提升性能

  ![](http://ra15bg9hk.hn-bkt.clouddn.com/react/diff.png)

- 同级比较，两个虚拟 DOM 的比对首先是同级的比对，第一层、第二层......如果有一级不同则不再比较，直接替换后面的全部 DOM。（虽然可能会造成 DOM 渲染的浪费，但是大大减少了两个虚拟 DOM 之间对比算法的性能损耗）

- 每个虚拟 DOM 节点的比较通过 key 值做关联（比较性能提升的前提，要保证前后虚拟 DOM 前后的 key 值一致，如果使用 index 作为 key 值就无法保证前后 key 值的一致，失去了 key 值存在的意义）

  ![](http://ra15bg9hk.hn-bkt.clouddn.com/react/key.PNG)

### React 中 ref 的使用

#### DOM 获取

（在 React 中除了 e.target 可以获取到 DOM 元素之外，ref 也可以）

ref 参数等于一个函数(箭头函数传递 this)，如下我们构建了一个 ref 的引用（this.inopt），指向 input 这个节点

```jsx
<input
  id="insertArea"
  className="input"
  ref={(input) => {
    this.input = input;
  }}
  value={this.state.inputValue}
  onChange={this.handleInputChange}
/>
// this.input === <input id="insertArea" class="input" value>
```

#### setState 异步问题

- ref 与 setState 共同使用可能出现的问题，setState 是异步函数不会立即执行

  ```jsx
  // jsx
      <ul ref={(ul) => { this.ul = ul }}>
          {this.getTodoItem()}
      </ul>
  
  // click event
        handleBtnClick() {
            if (this.state.inputValue.trim().length === 0) return
            this.setState((prevState) => ({
                list: [...prevState.list, prevState.inputValue],
                inputValue: ''
            }))
            console.log(this.ul.querySelectorAll('li').length)
        }
  ```

![](http://ra15bg9hk.hn-bkt.clouddn.com/react/ref.png)

- 如果希望在 setState 后获取到正确的 DOM，setState 接受第二个参数，是执行完的回调函数

  ```jsx
  handleBtnClick() {
      if (this.state.inputValue.trim().length === 0) return
      this.setState((prevState) => ({
          list: [...prevState.list, prevState.inputValue],
          inputValue: ''
      }), () => {
          console.log(this.ul.querySelectorAll('li').length)
      })
  }
  ```

### 生命周期函数

::: tip 生命周期函数

- 在某一个时刻组件会自动执行的函数
- render 函数需要定义
- state 和 props 发生改变时 render 函数自动执行；父组件的 render 函数重新执行时，子组件的 render 函数也会自动执行

:::

![](http://ra15bg9hk.hn-bkt.clouddn.com/react/lifeFunc.PNG)

- componentWillMount：在组件即将被挂载到页面的时刻自动执行

- componentDidMount：组件被挂载到页面之后，自动执行

- shouldComponentUpdate：在组件更新之前会被自动执行 (return Boolean)

  由返回的布尔值确定组件是否需要被更新

- componentWillUpdate：组件被更新之前，他会被自动执行，但是它在 shoudComponentUpdate 之后被执行，由 shoudComponentUpdate 的返回值确定是否执行

- componentDidUpdate：在组件更新之后自动执行

- componentWillReceiveProps：当一个组件从父组件接收参数，只要父组件的 render 函数被执行了，这个函数就会被执行

  如果这个组件第一次存在于父组件中，不会执行；如果这个组件已经存在于父组件中，才会执行

- componentWillUnmount：当组件即将从页面中剔除时执行

### 生命周期函数的使用

- 性能优化--shouldComponentUpdate：父组件 render 执行时，子组件的 render 函数也会执行。例如在 TodoList 中，输入框的改变导致了子组件 Item 的 render 函数重新执行，但是其实子组件只需要在 btnClick 时才需要执行：

  ```jsx
  shouldComponentUpdate(nextProps, nextState) {
      // 子组件TodoItem被渲染一次后，除非是content改变
      // 否则不允许无谓的render(父组件input改变导致的render重新执行)
      // render函数的执行需要生成虚拟DOM进行比对
      if (nextProps.content !== this.props.content) {
          return true
      } else {
          return false
      }
  }
  ```

- AJAX--componentDidMount：只在组件的生命周期中执行一次，考虑各种情况，这个最合适

### Charles 数据 mock

```jsx
componentDidMount() {
    Axios.get('api/todolist').then(res => {
        this.setState(() => ({
            list: [...res.data]
        }))
    }).catch(err => {
        console.warn(err)
    })
}
```

### React 中的 css 动画

- css3 的 transition 的过渡效果

  ```jsx
  import React, { Component, Fragment } from 'react';
  import './style.css';

  class App extends Component {
    constructor(props) {
      super(props);
      this.state = {
        show: true,
      };
      this.handleToggle = this.handleToggle.bind(this);
    }

    render() {
      return (
        <Fragment>
          <div className={this.state.show ? 'show' : 'hide'}>hello</div>
          <button onClick={this.handleToggle}>Toggle</button>
        </Fragment>
      );
    }

    handleToggle() {
      this.setState((prevState) => {
        return {
          show: prevState.show ? false : true,
        };
      });
    }
  }

  export default App;
  ```

  ```css
  .show {
    transition: all 0.3s ease-in;
    opacity: 1;
  }

  .hide {
    transition: all 0.3s ease-out;
    opacity: 0;
  }
  ```

- css 的动画效果@keyframes

  ```css
  .show {
    animation: show-item 2s ease-out;
  }
  
  .hide {
    animation: hide-item 2s ease-out forwards;
  }
  
  @keyframes hide-item {
    0% {
      opacity: 1;
      color: red;
    }
    50% {
      opacity: 0.5;
      color: green;
    }
    100% {
      opacity: 0;
      color: blue;
    }
  }
  @keyframes show-item {
    0% {
      opacity: 0;
      color: red;
    }
    50% {
      opacity: 0.5;
      color: green;
    }
    100% {
      opacity: 1;
      color: blue;
    }
  }
  ```

### react-transition-group

[csstransition]: https://reactcommunity.org/react-transition-group/css-transition

- CSSTransition 实现 class
- classNames 指定类名开头
- unmountOnExit 在 exit 后不渲染 DOM
- 钩子函数实现 js
- `appear={true}`实现入场动画的第一帧 （fade-appear,fade-appear-active）

```jsx
import React, { Component, Fragment } from 'react';
import { CSSTransition } from 'react-transition-group';
import './style.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
    };
    this.handleToggle = this.handleToggle.bind(this);
  }

  render() {
    return (
      <Fragment>
        <CSSTransition in={this.state.show} timeout={1000} classNames="fade">
          <div>hello</div>
        </CSSTransition>
        <button onClick={this.handleToggle}>Toggle</button>
      </Fragment>
    );
  }

  handleToggle() {
    this.setState((prevState) => {
      return {
        show: prevState.show ? false : true,
      };
    });
  }
}

export default App;
```

```css
/* 入场动画 */
.fade-enter {
  opacity: 0;
}

.fade-enter-active {
  opacity: 1;
  transition: opacity 1s ease-in;
}

.fade-enter-done {
  opacity: 1;
}

/* 出场动画 */
.fade-exit {
  opacity: 1;
}

.fade-exit-active {
  opacity: 0;
  transition: opacity 1s ease-in;
}

.fade-exit-done {
  opacity: 0;
}
```

- 出场之后修改文字颜色

  1. ```
     .fade-enter-done {
         opacity: 1;
         color: red
     }
     ```

  2. ```jsx
     <CSSTransition
       in={this.state.show}
       timeout={1000}
       classNames="fade"
       unmountOnExit
       onEntered={(el) => {
         el.style.color = 'blue';
       }}
     >
       <div>hello</div>
     </CSSTransition>
     ```

* TransitionGroup 可以在外层包裹实现多个动画的实现

  ```jsx
  <TransitionGroup>
    {this.state.list.map((item, index) => {
      return (
        <CSSTransition
          key={index}
          timeout={1000}
          classNames="fade"
          unmountOnExit
          onEntered={(el) => {
            el.style.color = 'blue';
          }}
          appear={true}
        >
          <div>item</div>
        </CSSTransition>
      );
    })}
    <button onClick={this.handleAddItem}>Toggle</button>
  </TransitionGroup>
  ```
