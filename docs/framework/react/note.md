# Note

## styled-components

::: tip styled-components

- 实现样式独享

- css 在某个组件内引入之后，其它组件没有引入但是也会生效（样式全局化）
- 实现样式只在引入的组件内生效

:::

### 全局样式

- createGlobalStyle 实现全局样式导入
- 组件内引入该样式组件，放在需要渲染组件的最上方

```js
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
    html, body, div, span, applet, object, iframe,
    h1, h2, h3, h4, h5, h6, p, blockquote, pre,
    a, abbr, acronym, address, big, cite, code,
    del, dfn, em, img, ins, kbd, q, s, samp,
    small, strike, strong, sub, sup, tt, var,
    b, u, i, center,
    dl, dt, dd, ol, ul, li,
    fieldset, form, label, legend,
    table, caption, tbody, tfoot, thead, tr, th, td,
    article, aside, canvas, details, embed, 
    figure, figcaption, footer, header, hgroup, 
    menu, nav, output, ruby, section, summary,
    time, mark, audio, video {
      margin: 0;
      padding: 0;
      border: 0;
      font-size: 100%;
      font: inherit;
      vertical-align: baseline;
    }
    /* HTML5 display-role reset for older browsers */
    article, aside, details, figcaption, figure, 
    footer, header, hgroup, menu, nav, section {
      display: block;
    }
    body {
      line-height: 1;
    }
    ol, ul {
      list-style: none;
    }
    blockquote, q {
      quotes: none;
    }
    blockquote:before, blockquote:after,
    q:before, q:after {
      content: '';
      content: none;
    }
    table {
      border-collapse: collapse;
      border-spacing: 0;
    }
`;
```

```js
import React, { Fragment } from "react";
import { GlobalStyle } from "./style.js";

function App() {
  return (
    <Fragment>
      <GlobalStyle />
      <div className="red">hello world</div>
    </Fragment>
  );
}

export default App;
```

### 样式组件

1. 创建一个 div 组件带有样式

   ```js
   import styled from "styled-components";

   export const HeaderWrapper = styled.div`
     height: 56px;
     background: red;
   `;
   ```

2. 组件引入使用该组件

   ```js
   import React, { Component } from "react";
   import { HeaderWrapper } from "./style";
   
   class Header extends Component {
     render() {
       return <HeaderWrapper>header</HeaderWrapper>;
     }
   }
   
   export default Header;
   ```

### 包含图片组件

- 图片需要**先引入**然后再使用（相对路径先编译后当前路径是根路径会出错）
- hred 这种属性可以直接在组件上写`<Logo href="/" />`，也可以在 style 的**attr**方法内添加

```js
import styled from "styled-components";
import LogoPic from "../../statics/logo.png";

export const Logo = styled.a.attrs({
  href: "/",
})`
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  height: 56px;
  width: 100px;
  background: url(${LogoPic});
  background-size: contain;
`;
```

---

---

通过`${(props)=> ~}`函数返回值使用**组件属性**

```html
<RecommendItem
       imgUrl={item.get("imgUrl")}
       key={item.get("id")}
></RecommendItem>
```

```js
export const RecommendItem = styled.div`
  width: 280px;
  height: 50px;
  margin-bottom: 5px;
  background-image: url(${(props) => props.imgUrl});
  background-size: contain;
`;
```

```js
var item = {
  id: 1,
  imgUrl: require("../../../statics/1.png"),
};
```

### Input 组件

`&::placeholder`更改 placeholder 文字颜色

```js
export const NavSearch = styled.input.attrs({
  placeholder: "搜索",
})`
  width: 160px;
  height: 38px;
  border: none;
  outline: none;
  border-radius: 19px;
  margin-top: 9px;
  margin-left: 20px;
  padding: 0 20px;
  background-color: #eee;
  font-size: 15px;
  box-sizing: border-box;
  &::placeholder {
    color: #999;
  }
`;
```

## iconfont 的使用

- 在 iconfont 新建仓库，添加对应图标，下载至本地

- 在 src/static 下新建 iconfont 文件夹

  ```sh
  |-- iconfont
  |   |-- iconfont.css
  |   |-- iconfont.eot
  |   |-- iconfont.svg
  |   |-- iconfont.ttf
  |   |-- iconfont.woff
  |   |-- iconfont.woff2
  ```

- 修改 iconfont.css 中的引用路径为相对路径

- 修改 iconfont.css 为 iconfont.js 文件，使用`createGlobalStyle`导出全局 iconfont 组件

  ```js
  import { createGlobalStyle } from "styled-components";

  export const IconFont = createGlobalStyle`
  @font-face {
    font-family: 'iconfont';
    src: url('./iconfont.eot?t=1591025542556'); /* IE9 */
    src: url('.l/iconfont.eot?t=1591025542556#iefix') format('embedded-opentype'),
      /* IE6-IE8 */
        url('data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAP8AAsAAAAACBQAAAOuAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHEIGVgCDHAqDUIMmATYCJAMQCwoABCAFhG0HRxsXB1GUzM0e2cdhHEMuSywmU5QSWtz4ard4+BpL39/9d9kQKlBMksdHRVKBjaiNapWrkBWqwtQC61beZJsVyirsqefM6JoaEmhqMJBztdeanNpL9KV/3Dv9fyc4n2W5jDVpbarzqAswmkABjb3ICihAjLlh7MqLWE9gwLxxqMvE9HzgIRndAvEGKzzwSJllTWZoQrdkbIr3XLXyUGoB8M7/fPwBvuFB0amMvlfPEiQQ/b37x0a/7c1W7iIk4znBJlGxAUjiRan7ETqMbaANKN9xcQRomsL37h+OPrb//6F0L+pm/uURikp0GelD4ACp6olJbB7B90AehR8eGjeJp7bBxAPgEyZnH1WkMuPl0aZZznOKfCv9kGpvL2xtzW9rK1j2MAptWHZsztSHD4uSwoK7tLd3Ygq98hkbW1K6cSCzvXcxf41dBgATzG1maT01p6hojj84vOD8YTD7CLvsHkXZCgovp9tIOHq97uFx29t65BdteBi2y+wZz/lBIWbci9qv5WHUxleWpQf7Pf0x8vzXsGr3jh0rRqlRpnX37q2rpsAVOvOuvXd/XYnSRrd17Lilr1/fALO8/kfP/3BqPlBU6DLNL7HQE8BfBm7LSU2j4ptQx/9CXLs1MqvAFCvgyIf5O9IgD4LNlOsZp44uxB0q2LTo0Hc3RaSmT4/ffYd/Gz4QfNozXjoq45NrnwUhjkppwLoIMnHG0HNJi0+t5dJPlYwrqY47fb0D9d91Cli1veHOojh0fPvvFGr7QWxGKZi6UlUpxGB6+OsvXXPpWqH7vLUDfZ7QAPTu1Nt0jI/+RwHaoA3+re3kcd63qk7hvzzY6yr6/Dt6IfL27iToJ/k3ktaSnyhpmZOqzLBkynJbrHnScaKbggED+HUpJrwYQzvdOp3QTMdQ9JmDqllAk9yAjkEH0NWcwIB1SZMHTdLRIvuxZgGAMOYUFCM+QjWmDk3yOXTM+ARdY0HDgOvoNuegpcBMnI54giQoTIFYVJ2yZSNMkJmLlAl2Xk/KfGYh0g0chD6cdzaZhJxIH2OAMVHxJUSGsq46YCLYDNntKtR01YpEwlkI0ULNZrnsRZyoOgDjgg7hEYgEEkwBYSKVk+wWJpjc+3MhignseHpNVoW/EKIz4NohHxzvFmiS2tkq61ouMUyk8EUQMkimUzlAicCJ2M2YCtLKW1khIoJj6RHRhDKjfHJbNTe/1vGEq2CAMU9GiRoZHQPPeKci8VbsDjfF8Gw2chpTJjh4VcAAAAAA')
        format('woff2'),
      url('./iconfont.woff?t=1591025542556') format('woff'),
      url('./iconfont.ttf?t=1591025542556') format('truetype'),
      /* chrome, firefox, opera, Safari, Android, iOS 4.2+ */
        url('./iconfont.svg?t=1591025542556#iconfont') format('svg'); /* iOS 4.1- */
  }
  
  .iconfont {
    font-family: 'iconfont' !important;
    font-size: 16px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .iconfangdajing:before {
    content: '\e614';
  }
  
  .iconAa:before {
    content: '\e636';
  }
  
  .iconPensyumaobi:before {
    content: '\e708';
  }
  `;
  ```

- App.js 使用 IconFont 组件

  ```js
  import React, { Fragment } from "react";
  import Header from "./common/header";
  import { GlobalStyle } from "./style.js";
  import { IconFont } from "./statics/iconfont/iconfont.js";
  
  function App() {
    return (
      <Fragment>
        <GlobalStyle />
        <IconFont />
        <Header />
      </Fragment>
    );
  }
  
  export default App;
  ```

## 输入框动画

- 定义事件 onFocus、onBlur

  ```js
  handleInpusFocus() {
      this.setState({
          focused: true
      })
  }

  handleInpusBlur() {
      this.setState({
          focused: false
      })
  }
  ```

- 引入 CSSTransition，设置`classNames`属性

  ```html
  <CSSTransition timeout={200} in={this.state.focused} classNames="slide">
      <NavSearch onFocus={this.handleInpusFocus} onBlur={this.handleInpusBlur} 				className={this.state.focused ? 'focused' : ''}
      ></NavSearch>
  </CSSTransition>
  ```

- 添加动画样式 slide-enter、slide-enter-active、slide-exit、slide-exit-active

  ```js
  export const SearchWrapper = styled.div`
    float: left;
    position: relative;
    .slide-enter {
      width: 160px;
      transition: all 0.3s ease-out;
    }
    .slide-enter-active {
      width: 240px;
    }
    .slide-exit {
      transition: all 0.3s ease-out;
    }
    .slide-exit-active {
      width: 160px;
    }
    .iconfont {
      position: absolute;
      right: 5px;
      bottom: 5px;
      width: 30px;
      height: 30px;
      border-radius: 15px;
      line-height: 30px;
      text-align: center;
      &.focused {
        background-color: #777;
        color: #fff;
      }
    }
  `;
  ```

## redux && react-redux

- 定义 store/index.js

  ```js
  import { createStore } from "redux";
  import reducer from "./reducer";

  const store = createStore(reducer);

  export default store;
  ```

- store/reducer.js

  ```js
  const defaultState = {
    focused: false,
  };

  export default (state = defaultState, action) => {
    if (action.type === "search_focus") {
      return {
        focused: true,
      };
    }
    if (action.type === "search_blur") {
      return {
        focused: false,
      };
    }
    return state;
  };
  ```

- App.js 引入 store 和 Provider 组件

  ```js
  import React, { Fragment } from "react";
  import Header from "./common/header";
  import store from "./store";
  import { Provider } from "react-redux";
  import { GlobalStyle } from "./style.js";
  import { IconFont } from "./statics/iconfont/iconfont.js";

  function App() {
    return (
      <Fragment>
        <GlobalStyle />
        <IconFont />
        <Provider store={store}>
          <Header />
        </Provider>
      </Fragment>
    );
  }

  export default App;
  ```

- 对应组件引入 connect

  ```js
  import React from 'react';
  import { connect } from 'react-redux';
  
  const Header = (props) => {
    return (
  	......
    )
  }
  
  const mapStateToProps = (state) => {
    return {
      focused: state.focused
    }
  }
  
  const mapDispatchToProps = (dispatch) => {
    return {
    }
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(Header);
  ```

## redux-devtools-extension

https://github.com/zalmoxisus/redux-devtools-extension

```js
import { createStore, compose } from "redux";
import reducer from "./reducer";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer, composeEnhancers());

export default store;
```

## reducer 拆分

reducer 如果存放过多的数据可能会造成代码的不可维护，reducer 的拆分和整合

### 拆分

- common/header/store/reducer.js

```js
const defaultState = {
  focused: false,
};

export default (state = defaultState, action) => {
  if (action.type === "search_focus") {
    return {
      focused: true,
    };
  }
  if (action.type === "search_blur") {
    return {
      focused: false,
    };
  }
  return state;
};
```

- common/header/store/index.js 导出

```js
import reducer from "./reducer";

export { reducer };
```

### 整合

- store/reducer.js `combineReducers`方法整合 reducer
- as 是 es6 实现的别名

```js
import { combineReducers } from "redux";
import { reducer as headerReducer } from "../common/header/store";

const reducer = combineReducers({
  header: headerReducer,
});

export default reducer;
```

- 组件内 state 路径修改

```js
const mapStateToProps = (state) => {
  return {
    // 整合后的focused在state的header下
    focused: state.header.focused,
  };
};
```

## actionCreators

```sh
|-- header
|   |-- store
|   |   |-- actionCreators.js
|   |   |-- constants.js
|   |   |-- index.js
|   |   |-- reducer.js
|   |-- index.js
|   |-- style.js
```

- actionCreators 创建 action

  ```js
  import * as constants from "./constants";

  export const searchFocus = () => ({
    type: constants.SEARCH_FOCUS,
  });

  export const searchBlur = () => ({
    type: constants.SEARCH_BLUR,
  });
  ```

- constants 统一定义 action types

  ```js
  export const SEARCH_FOCUS = "header/SEARCH_FOCUS";
  export const SEARCH_BLUR = "header/SEARCH_BLUR";
  ```

- store/index 统一导出

  ```js
  import reducer from "./reducer";
  import * as actionCreators from "./actionCreators";
  import * as constants from "./constants";

  export { reducer, actionCreators, constants };
  ```

- reducer

  ```js
  import * as constants from "./constants";

  const defaultState = {
    focused: false,
  };

  export default (state = defaultState, action) => {
    if (action.type === constants.SEARCH_FOCUS) {
      return {
        focused: true,
      };
    }
    if (action.type === constants.SEARCH_BLUR) {
      return {
        focused: false,
      };
    }
    return state;
  };
  ```

- header/index.js 使用 actionCreators 创建 action

  ```js
  import { actionCreators } from './store';
  
  ......
  
  const mapDispatchToProps = (dispatch) => {
    return {
      handleInpusFocus() {
        dispatch(actionCreators.searchFocus())
      },
      handleInpusBlur() {
        dispatch(actionCreators.searchBlur())
      }
    }
  }
  ```

## Immutable.js

::: tip

- state 不能直接修改，reducer 应返回一个新的 state
- 原始的方法存在 state 被误修改的风险
- immutable.js 帮助我们生成一个 immutable 对象（不可改变）
- 实现 state 不可改变（fromJS、get、set）

:::

1. 将 reducer 中的 state 转化为通过`fromJS`方法转化为 immutable 对象

   ```js
   import { fromJS } from "immutable";

   const defaultState = fromJS({
     focused: false,
   });
   ```

2. 此时 state.header 对象已经是一个 immutable，属性的获取通过`get`方法获得

   ```js
   const mapStateToProps = (state) => {
     return {
       focused: state.header.get("focused"),
     };
   };
   ```

3. reducer 再返回新的 state 之后，是一个普通的对象，通过 get 方法获取会报错。

   immutable 对象`set`方法: 会结合之前 immutable 对象的值和设置的值返回一个**全新**的对象！

   ```js
   export default (state = defaultState, action) => {
     if (action.type === constants.SEARCH_FOCUS) {
       return state.set("focused", true);
     }
     if (action.type === constants.SEARCH_BLUR) {
       return state.set("focused", false);
     }
     return state;
   };
   ```

::: tip

```js
state.set("list", action.data).set("totalPage", action.totalPage);

// merge比多次的set操作性能更高
state.merge({
  list: action.data,
  totalPage: action.totalPage,
});
```

:::

## redux-immutable

::: tip

- 获取 focus 需要调用 state.header.get('focused')，state 和 header 两个对象类型不统一
- 应该将 state 也转化成 immutable 对象（redux-immutable）
- redux-immutable 也提供了一个`combineReducers`方法生成的是 immutable 对象

:::

1. store/reducer.js

   ```js
   import { combineReducers } from "redux-immutable";
   import { reducer as headerReducer } from "../common/header/store";

   const reducer = combineReducers({
     header: headerReducer,
   });

   export default reducer;
   ```

2. ```js
   const mapStateToProps = (state) => {
     return {
       // focused: state.get('header').get('focused')
       focused: state.getIn(["header", "focused"]),
     };
   };
   ```

## redux-thunk & axios

- 异步数据的获取都拆分到 actionCreators 中，要求 actionCreators 返回值从对象变成函数，这需要`redux-thunk`这个中间件，修改 store/index 配置如下:

  ```js
  import { createStore, compose, applyMiddleware } from "redux";
  import thunk from "redux-thunk";
  import reducer from "./reducer";

  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)));

  export default store;
  ```

- list 作为 state 的内部数组也是 immutable 类型的数组，如果直接派发改变会将该数组变成普通数组，在`changeList`函数中生成的 action 的 list 需要`fromJs`方法转换一下

  ```js
  import * as constants from "./constants";
  import { fromJS } from "immutable";
  import axios from "axios";

  const changeList = (data) => ({
    type: constants.CHANGE_LIST,
    data: fromJS(data),
  });

  export const getList = () => {
    return (dispatch) => {
      axios
        .get("api/headerList.json")
        .then((res) => {
          const { success, data } = res.data;
          if (success) {
            dispatch(changeList(data));
          }
        })
        .catch(() => {
          console.log("err");
        });
    };
  };
  ```

- 数组改变之后需要通过数组的`map`方法循环展示数据

  ```html
  <SearchInfoList>
    { this.props.list.map((item) => { return
    <SearchInfoItem key="{item}">{item}</SearchInfoItem>
    }) }
  </SearchInfoList>
  ```

### 调整

reducer.js：switch 语法一般需要跟 break，这边 case 之后有 return，就不需要了

```js
import * as constants from "./constants";
import { fromJS } from "immutable";

const defaultState = fromJS({
  focused: false,
  list: [],
});

export default (state = defaultState, action) => {
  switch (action.type) {
    case constants.SEARCH_FOCUS:
      return state.set("focused", true);
    case constants.SEARCH_BLUR:
      return state.set("focused", false);
    case constants.CHANGE_LIST:
      return state.set("list", action.data);
    default:
      return state;
  }
};
```

### 请求优化

list 数据在请求之后便不需要再重复请求了，`handleInpusFocus`内传入 list，请求时判断

```js
<NavSearch
  onFocus={() => handleInpusFocus(list)}
  onBlur={handleInpusBlur}
  className={focused ? "focused" : ""}
></NavSearch>
```

```js
handleInpusFocus(list) {
    (list.size === 0) && dispatch(actionCreators.getList())
    dispatch(actionCreators.searchFocus())
}
```

## css 实现旋转动画

- 使用`ref`获取到原始 dom 标签，在`handlePageChange`中传入

```html
<SearchInfoSwitch
    onClick={() => handlePageChange(page, totalPage, this.spinIcon)}
  	>
    <i ref={(icon) => { this.spinIcon = icon }} className="iconfont spin">&#xe77f;</i>
    换一批
</SearchInfoSwitch>
```

- `handlePageChange`获取到 style 的 transform 属性，将非数字替换为空

  旋转角度自增 360，更新`transform: rotate(xxxdeg)`

```js
handlePageChange(page, totalPage, spin) {
    let originAngle = spin.style.transform.replace(/[^0-9]/ig, '');
    if (originAngle) {
        originAngle = parseInt(originAngle, 10)
    } else {
        originAngle = 0
    }
    spin.style.transform = 'rotate(' + (originAngle + 360) + 'deg)';
    if (page < totalPage) {
        dispatch(actionCreators.changePage(page + 1));
    } else {
        dispatch(actionCreators.changePage(1));
    }
}
```

- block 标签才能 transform 旋转

  transform-origin 设置旋转中心，这边是 center

  transition 设置动画

```js
export const SearchInfoSwitch = styled.span`
  float: right;
  cursor: pointer;
  font-size: 13px;
  .spin {
    display: block;
    float: left;
    font-size: 12px;
    margin-right: 2px;
    transition: all 0.2s ease-in;
    transform-origin: center center;
  }
`;
```

## 路由

```sh
npm install --save react-router-dom
```

```js
import React, { Fragment } from "react";
import Header from "./common/header";
import store from "./store";
import { BrowserRouter, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { GlobalStyle } from "./style.js";
import { IconFont } from "./statics/iconfont/iconfont.js";

function App() {
  return (
    <Fragment>
      <GlobalStyle />
      <IconFont />
      <Provider store={store}>
        <Header />
        <BrowserRouter>
          <Route path="/" exact render={() => <div>home</div>}></Route>
          <Route path="/detail" exact render={() => <div>detail</div>}></Route>
        </BrowserRouter>
      </Provider>
    </Fragment>
  );
}

export default App;
```

::: tip react-router-dom

- path 属性匹配路由，添加**exact**属性后`/detail`页面将不会加载 home 组件
- **Route**组件的 render 返回渲染内容（路由规则）
- 即根据路由的不同渲染不同的组件

:::

```html
<BrowserRouter>
  <Route path="/" exact component="{Home}"></Route>
  <Route path="/detail" component="{Detail}"></Route>
</BrowserRouter>
```

## 数据异步获取

::: tip mapDispatch

- 父组件通过`connect`方法连接 store，在父组件`dispatch`的 action，**所有**的子组件都能接收到
- `formJS`方法可以将普通对象转化为 immutableJS 对象，然后`set`更新 state
- `merge`方法同上可以执行多次的`set`操作
- 通过**redux-thunk**可以实现将异步请求放到 action 中管理，而不是在组件内

:::

### 组件内的获取

1. connect 方法连接 store
2. componentDidMount 时创建 action 派发给 reducer
3. reducer 根据 action.type 设置 immutableJS 数据返回

```js
// pages/home/index.js
import React, { Component } from 'react';
import { connect } from "react-redux";
import axios from "axios";

class Home extends Component {
    render() {
        return (
			// JSX
        )
    }

    componentDidMount() {
        this.props.changeHomeData()
    }
}

const mapDispatch = (dispatch)=> ({
    changeHomeData() {
        axios.get("/api/home.json").then(res=>{
            const {success,data} = res.data;
            if(success) {
                const {topicList,articleList,recommendList} = data
                const action = {
                    type: "change_home_data",
                    topicList,
                    articleList,
                    recommendList
                }
                dispatch(action);
            }
        })
    }
})

export default connect(null,mapDispatch)(Home);
```

```js
// reducer.js
import { fromJS } from "immutable";

const defaultState = fromJS({
  topicList: [],
  articleList: [],
  recommendList: [],
});

export default (state = defaultState, action) => {
  switch (action.type) {
    case "change_home_data":
      return state.merge({
        topicList: fromJS(action.topicList),
        articleList: fromJS(action.articleList),
        recommendList: fromJS(action.recommendList),
      });
    default:
      return state;
  }
};
```

### 请求代码优化管理

::: tip redux

- 首先创建 action，派发给 reducer
- reducer 获取 action，最后更新 state
- actionCreators 管理 action 的创建
- constants 管理 actionTypes
- redux-thunk 能够实现 action 的创建返回一个函数（getHomeInfo 返回函数，函数内创建 action 然后派发）

:::

#### 组件 index

获取 actionCreators 方法创建 action，并且派发给 reducer

```js
import React, { Component } from 'react';
import { connect } from "react-redux";
import { actionCreators } from "./store";

class Home extends Component {
    render() {
        return (
            // JSX
        )
    }

    componentDidMount() {
        this.props.changeHomeData()
    }
}

const mapDispatch = (dispatch)=> ({
    changeHomeData() {
        const action = actionCreators.getHomeInfo();
        dispatch(action)
    }
})

export default connect(null,mapDispatch)(Home);
```

#### actionCreators

```js
import axios from "axios";
import * as constants from "./constants";

const changeHomeData = (result) => ({
  type: constants.CHANGE_HOME_DATA,
  topicList: result.topicList,
  articleList: result.articleList,
  recommendList: result.recommendList,
});
// !!!!!!!!!  redux-thunk
export const getHomeInfo = () => {
  return (dispatch) =>
    axios.get("/api/home.json").then((res) => {
      const { success, data } = res.data;
      success && dispatch(changeHomeData(data));
    });
};
```

#### constants

```js
export const CHANGE_HOME_DATA = "home/CHANGE_HOME_DATA";
```

#### index

```js
import reducer from "./reducer";
import * as constants from "./constants";
import * as actionCreators from "./actionCreators";

export { reducer, actionCreators, constants };
```

#### reducer

```js
import { fromJS } from "immutable";
import * as constants from "./constants";

const defaultState = fromJS({
  topicList: [],
  articleList: [],
  recommendList: [],
});

export default (state = defaultState, action) => {
  switch (action.type) {
    case constants.CHANGE_HOME_DATA:
      return state.merge({
        topicList: fromJS(action.topicList),
        articleList: fromJS(action.articleList),
        recommendList: fromJS(action.recommendList),
      });
    default:
      return state;
  }
};
```

## 页面路由参数获取

### params 参数

- `App.js`组件路由设置

```html
<Route path="/detail/:id" component="{Detail}"></Route>
```

- home 页面 List 组件添加**参数跳转**

```html
<Link key={index} to={"/detail/" + item.get("id")}>
	...
</Link>
```

- detail 页面参数获取 `this.props.match.params.id`

```js
componentDidMount() {
    this.props.getDetail(this.props.match.params.id);
}
```

### query 参数

- `App.js`组件路由**无需设置**特殊参数

```html
<Route path="/detail" component="{Detail}"></Route>
```

- home 页面 List 组件添加**参数跳转**

```html
<Link key={index} to={"/detail?id=" + item.get("id")}>
	...
</Link>
```

- 参数获取`this.props.location.search`，需要自己**再处理**这个参数

```
?id=2
```

## 异步组件加载

实现页面在访问某个路由页面的时候再加载**对应的 js**文件，减少首屏加载时间

```shell
|-- pages
|   |-- detail
|   |   |-- store
|   |   |-- index.js
|   |   |-- loadable.js
|   |   |-- style.js
```

- #### loadable.js

```js
import Loadable from "react-loadable";
import React from "react";

const LoadableComponent = Loadable({
  loader: () => import("./index"),
  loading() {
    return <div>正在加载...</div>;
  },
});

export default () => <LoadableComponent />;
```

- #### withRouter

**detail 页面**需要获取对应的文章 id，但是经过**loadable**处理返回后的组件已经无法再直接拿到参数，需要借助 react-router-dom 的**withRouter**包装返回

`export default connect(mapState, mapDispatch)(withRouter(Detail));`

## 加载更多

1. 点击**更多文字**派发 action 异步获取下一页数据 （page 表示当前页页码，获取时增 1）
2. 获取成功后派发 addHomeList 这个 action,reducer 接收后 concat 文章数据

```js
import React, { PureComponent } from "react";
import { ListItem, ListInfo, LoadMore } from "../style";
import { connect } from "react-redux";
import { actionCreators } from "../store";
import { Link } from "react-router-dom";

class List extends PureComponent {
  render() {
    const { list, getMoreList, page } = this.props;
    return (
      <div>
        {list.map((item, index) => {
          return (
            <Link key={index} to="/detail">
              <ListItem>
                <img className="pic" alt="" src={item.get("imgUrl")} />
                <ListInfo>
                  <h3 className="title">{item.get("title")}</h3>
                  <p className="desc">{item.get("desc")}</p>
                </ListInfo>
              </ListItem>
            </Link>
          );
        })}
        <LoadMore onClick={() => getMoreList(page)}>更多文字</LoadMore>
      </div>
    );
  }
}

const mapState = (state) => ({
  list: state.getIn(["home", "articleList"]),
  page: state.getIn(["home", "articlePage"]),
});

const mapDispatch = (dispatch) => ({
  getMoreList(page) {
    dispatch(actionCreators.getMoreList(page));
  },
});

export default connect(mapState, mapDispatch)(List);
```

### actionCreators

```js
const addArticleList = (state, action) => {
  return state.merge({
    articleList: state.get("articleList").concat(action.list),
    articlePage: action.nextPage,
  });
};

export const getMoreList = (page) => {
  return (dispatch) => {
    axios.get(`/api/homeList.json?page=${page}`).then((res) => {
      const data = res.data.data;
      dispatch(addHomeList(data, page + 1));
    });
  };
};
```

### reducer

```js
const addArticleList = (state, action) => {
  return state.merge({
    articleList: state.get("articleList").concat(action.list),
    articlePage: action.nextPage,
  });
};
```

## 回到顶部

1. 监听 window 的 scroll 事件，到达阈值显示回到顶部按钮
2. 点击回到顶部执行 window.scrollTl(0,0)
3. componentWillUnmount 移除监听

```js
import React, { PureComponent } from "react";
import { connect } from "react-redux";
<<<<<<< HEAD
import { withRouter } from "react-router-dom";

class Detail extends PureComponent {
  render() {
    const { title, content } = this.props;
    return (
      JSX......
=======
import List from "./components/List";
import Recommend from "./components/Recommend";
import Writer from "./components/Writer";
import Topic from "./components/Topic";
import { HomeWrapper, HomeLeft, HomeRight, BackTop } from "./style";
import { actionCreators } from "./store";

class Home extends PureComponent {
  handleScrollTop() {
    window.scrollTo(0, 0);
  }
  render() {
    const { showScroll } = this.props;
    return (
      <HomeWrapper>
        <HomeLeft>
          <img
            className="banner-img"
            alt=""
            src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1592200833675&di=6fc258493302450c75369d484e287e9b&imgtype=0&src=http%3A%2F%2Fattach.bbs.miui.com%2Fforum%2F201306%2F23%2F110328s72xxse7lfis9fnd.jpg"
          />
          <Topic />
          <List />
        </HomeLeft>
        <HomeRight>
          <Recommend />
          <Writer />
        </HomeRight>
        {showScroll ? (
          <BackTop onClick={this.handleScrollTop}>回到顶部</BackTop>
        ) : null}
      </HomeWrapper>
>>>>>>> c126359de7417042a3f2a740f3802ed80315daa0
    );
  }

  componentDidMount() {
<<<<<<< HEAD
    this.props.getDetail(this.props.match.params.id);
=======
    this.props.changeHomeData();
    // 滚动事件监听
    this.bindEvent();
  }

  componentWillUnmount() {
    // 移除事件
    window.removeEventListener("scroll", this.props.changeScrollTopShow);
  }

  bindEvent() {
    window.addEventListener("scroll", this.props.changeScrollTopShow);
>>>>>>> c126359de7417042a3f2a740f3802ed80315daa0
  }
}

const mapState = (state) => ({
<<<<<<< HEAD
});

const mapDispatch = (dispatch) => ({
});

export default connect(mapState, mapDispatch)(withRouter(Detail));
=======
  showScroll: state.getIn(["home", "showScroll"]),
});

const mapDispatch = (dispatch) => ({
  changeHomeData() {
    dispatch(actionCreators.getHomeInfo());
  },
  changeScrollTopShow(e) {
    // 派发toggleTopShow
    if (document.documentElement.scrollTop > 400) {
      dispatch(actionCreators.toggleTopShow(true));
    } else {
      dispatch(actionCreators.toggleTopShow(false));
    }
  },
});

export default connect(mapState, mapDispatch)(Home);
```

## 路由跳转

react 的单页面应用由**react-router-dom**实现路由的跳转，不会重新加载 html，只改变部分区域的显示

**Link**组件实现链接

```html
<Link to="/detail">跳转到详情页</Link>
```

## PureComponent

组件需要使用`shouldComponentUpdate`观察不需要重新渲染的 redux 数据，减少某些组件的不必要重新渲染

在使用了`immutable.js`下，我们只需要引入**PureComponent**代替原来的 Component 的 class 即可自动实现该功能

```js
import React, { PureComponent } from "react";

class List extends PureComponent {
  render() {
    // ....
  }
}
>>>>>>> c126359de7417042a3f2a740f3802ed80315daa0
```
