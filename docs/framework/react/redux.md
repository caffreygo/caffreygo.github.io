# Redux

## 基础

redux（Reducer+Flux）实现了大型应用组件间数据传值的问题（数据层框架）

![](http://ra15bg9hk.hn-bkt.clouddn.com/react/withRedux.PNG)

### Redux的工作流程

![](http://ra15bg9hk.hn-bkt.clouddn.com/react/reduxFlow.PNG)

- React Components(借阅者)
- Action Creators(借书的这句话)
- Store(管理员)
- Reducers(记录本)

### 创建redux中的store

- reducer中的**state**存放store里面的数据（笔记本）

  ```js
  const defaultState = {
    inputValue: '123',
    list: ['1', '2', '3']
  }
  
  export default (state = defaultState, action) => {
    return state
  }
  ```

- createStore函数第一个参数将reducer数据传给store

  ```js
  import { createStore } from 'redux'
  import reducer from './reducer'
  
  const store = createStore(reducer);
  
  export default store
  ```

- 页面引入store，通过getState方法获取state数据

  ```js
  constructor(props) {
      super(props)
      this.state = store.getState()
  }
  ```

### Action和Reducer

- action是一个对象，包含了type和value，store通过dispatch将action传递给store

  ```js
  handleInputChange(e) {
      const action = {
          type: 'change_input_value',
          value: e.target.value
      }
      store.dispatch(action)
  }
  ```

- reducer接收action的type和value更新store(return newState)，注意：reducer不能直接修改state(深拷贝)

  ```js
  const defaultState = {
      inputValue: '',
      list: []
  }
  
  export default (state = defaultState, action) => {
      if (action.type === 'change_input_value') {
          const newState = JSON.parse(JSON.stringify(state))
          newState.inputValue = action.value;
          return newState
      }
      if (action.type === 'delete_todo_item') {
          const newState = JSON.parse(JSON.stringify(state))
          newState.list.splice(action.value, 1);
          return newState
      }
      if (action.type === 'add_todo_item') {
          const newState = JSON.parse(JSON.stringify(state))
          newState.list.push(newState.inputValue)
          newState.inputValue = ''
          return newState
      }
      return state
  }
  ```

- 组件需要订阅store更新，然后重新获取state`store.getState()`

  ```js
  constructor(props) {
      super(props)
      this.handleInputChange = this.handleInputChange.bind(this)
      this.handleStoreChange = this.handleStoreChange.bind(this)
      this.state = store.getState()
      // 订阅store更新
      store.subscribe(this.handleStoreChange)
  }
  
  // ......
  
  // 重新获取state
  handleStoreChange() {
      this.setState(store.getState())
  }
  
  // 点击删除item
  handleItemDelete(index) {
      const action = {
          type: 'delete_todo_item',
          value: index
      }
      store.dispatch(action)
  }
  
  // 点击btn添加listItem
  handleBtnClick() {
      const action = {
          type: 'add_todo_item'
      }
      store.dispatch(action)
  }
  ```

### ActionTypes的拆分

- 常量或者变量的错误方便查错
- 字符串的拼写错误不好发现

```js
export const CHANGE_INPUT_VALUE = 'change_input_value'
export const ADD_TODO_ITEM = 'add_todo_item'
export const DELETE_TODO_ITEM = 'delete_todo_item'
```

### actionCreator

```js
import { CHANGE_INPUT_VALUE, ADD_TODO_ITEM, DELETE_TODO_ITEM } from './actionTypes'

export const getInputChangeAction = (value) => ({
    type: CHANGE_INPUT_VALUE,
    value: value
})

export const getAddItemAction = () => ({
    type: ADD_TODO_ITEM
})

export const getDeleteItemAction = (index) => ({
    type: DELETE_TODO_ITEM,
    value: index
})
```

组件中创建action，然后派发出去

```js
handleInputChange(e) {
    const action = getInputChangeAction(e.target.value)
    store.dispatch(action)
}
```

### Redux三大原则

- store是唯一的

- 只有store能够改变自己的内容

  reducer是拿到store之前的数据，然后将更改后的数据再返回给store

  store拿到数据之后自己进行更新（reducer不能更改store的内容）

- reducer必需是纯函数

  纯函数：给定固定的输入，就一定会有固定的输出，而且不会有任何副作用

  1. state和action确定，return的结果就是固定的

     `newState.date = new Date()`不是纯函数，异步、ajax...

  2. `state.inputValue = action.value`参数修改 （副作用）也不是纯函数

## 进阶

### UI组件和容器组件

UI组件只关注于组件的内容，容器组件负责处理组件逻辑代码

#### UI组件

```jsx
// TodoListUI
import React, { Component } from 'react';
import 'antd/dist/antd.css';
import { Input, Button, List } from 'antd';

class TodoListUI extends Component {
  render() {
    return (
      <div style={{ marginTop: '10px', marginLeft: '10px' }}>
        <div style={{ marginBottom: '10px' }}>
          <Input
            value={this.props.inputValue}
            placeholder="todoInfo"
            style={{ width: '300px', marginRight: '20px' }}
            onChange={this.props.handleInputChange}
          />
          <Button type="primary" onClick={this.props.handleBtnClick}>提交</Button>
        </div>
        <List
          style={{ width: '300px' }}
          bordered
          dataSource={this.props.list}
          renderItem={(item, index) => (
            <List.Item onClick={() => { this.props.handleItemDelete(index) }}>
              {item}
            </List.Item>
          )}
        />
      </div>
    )
  }
}

export default TodoListUI
```

#### 容器组件

```jsx
import React, { Component } from 'react';
import store from '../store';
import TodoListUI from './TodoListUI'
import { getInputChangeAction, getAddItemAction, getDeleteItemAction } from '../store/actionCreator'

class TodoList extends Component {

  constructor(props) {
    super(props)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleStoreChange = this.handleStoreChange.bind(this)
    this.handleBtnClick = this.handleBtnClick.bind(this)
    this.handleItemDelete = this.handleItemDelete.bind(this)
    this.state = store.getState()
    store.subscribe(this.handleStoreChange)
  }

  render() {
    return (
      < TodoListUI
        inputValue={this.state.inputValue}
        list={this.state.list}
        handleBtnClick={this.handleBtnClick}
        handleInputChange={this.handleInputChange}
        handleItemDelete={this.handleItemDelete}
      />
    )
  }

  handleInputChange(e) {
    const action = getInputChangeAction(e.target.value)
    store.dispatch(action)
  }

  handleStoreChange() {
    this.setState(store.getState())
  }

  handleItemDelete(index) {
    const action = getDeleteItemAction(index)
    store.dispatch(action)
  }

  handleBtnClick() {
    const action = getAddItemAction()
    store.dispatch(action)
  }
}

export default TodoList
```

#### 注意

onClick中的箭头函数参数默认是Event事件对象，index向外获取正确参数

```jsx
<List
    style={{ width: '300px' }}
    bordered
    dataSource={this.props.list}
    renderItem={(item, index) => (
        <List.Item onClick={() => { this.props.handleItemDelete(index) }}>
            {item}
        </List.Item>
    )}
/>
```

### 无状态组件

::: tip 无状态组件

- 当一个普通组件内只要一个render函数时，便可以用无状态组件替换它
- 无状态组件以函数的形式实现，性能比较（和js类）高
- 函数组件参数为props，返回JSX

:::

```jsx
import React from 'react';
import 'antd/dist/antd.css';
import { Input, Button, List } from 'antd';

const TodoListUI = (props) => {
  return (
    <div style={{ marginTop: '10px', marginLeft: '10px' }}>
      <div style={{ marginBottom: '10px' }}>
        <Input
          value={props.inputValue}
          placeholder="todoInfo"
          style={{ width: '300px', marginRight: '20px' }}
          onChange={props.handleInputChange}
        />
        <Button type="primary" onClick={props.handleBtnClick}>提交</Button>
      </div>
      <List
        style={{ width: '300px' }}
        bordered
        dataSource={props.list}
        renderItem={(item, index) => (
          <List.Item onClick={() => { props.handleItemDelete(index) }}>
            {item}
          </List.Item>
        )}
      />
    </div>
  )
}

export default TodoListUI
```

### Redux异步请求数据

- actionTypes

  ```js
  export const INIT_LIST_ACTION = 'init_list_action'
  ```

- actionCreator

  ```js
  import { INIT_LIST_ACTION } from './actionTypes'
  
  export const initListAction = (data) => ({
      type: INIT_LIST_ACTION,
      data
  })
  ```

- reducer

  ```js
  import { INIT_LIST_ACTION } from './actionTypes'
  
  const defaultState = {
      inputValue: '',
      list: []
  }
  
  export default (state = defaultState, action) => {
      if (action.type === INIT_LIST_ACTION) {
          const newState = JSON.parse(JSON.stringify(state))
          newState.list = action.data
          return newState
      }
      return state
  }
  ```

- TodoList

  ```js
  import store from '../store';
  import axios from 'axios';
  import { initListAction } from '../store/actionCreator';
  
  componentDidMount() {
      axios.get('/api/todolist').then((res) => {
          const { data } = res
          const action = initListAction(data)
          store.dispatch(action)
      })
  }
  ```

### Redux-thunk ajax

::: tip Redux-thunk

- Redux-thunk实现异步请求和复杂逻辑在action的统一处理（Redux的中间件）
- 异步操作的代码从组件移动到action中

- actionCreator原本是一个函数返回一个对象，在使用了该中间件之后：action可以是一个**函数**，store能够dispatch这个函数
- store接收到函数会自动执行（异步数据的获取，然后改变store，又dispatch action做一次派发）

:::

#### store/index.js配置

- redux-devtools-extension: https://github.com/zalmoxisus/redux-devtools-extension

- 实现既支持redux-devtools，同时引入redux-thunk

```js
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk';
import reducer from './reducer';

const composeEnhancers =
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

const enhancer = composeEnhancers(
    applyMiddleware(thunk),
);
const store = createStore(reducer, enhancer);

export default store
```

#### actionCreator

```js
import axios from 'axios';
import { INIT_LIST_ACTION } from './actionTypes';

export const initListAction = (data) => ({
    type: INIT_LIST_ACTION,
    data
})

export const getTodoList = () => {
    return (dispatch) => {
        axios.get('/api/todolist').then((res) => {
            const { data } = res
            const action = initListAction(data)
            dispatch(action)
        })
    }
}
```

#### TodoList

```js
import { getTodoList } from '../store/actionCreator';

componentDidMount() {
    // action是一个函数
    const action = getTodoList()
    // 调用store来dispatch action时，action函数会被自动执行
    store.dispatch(action)
}
```

::: tip 异步请求和逻辑放到actionCreator的好处

- 减少生命周期函数的代码量
- 有利于自动化测试（getTodoList函数相比生命周期函数更方便测试）

:::

### Redux中间件

- redux中间件是表示在action和store中间的处理

- Redux-thunk对dispatch这个方法做了升级，调用dispatch传递对象保持原样，而如果是传递函数，会先执行这个函数，在需要的时候再调用store(根据参数的不同执行不同的逻辑)

![](http://ra15bg9hk.hn-bkt.clouddn.com/react/middleware.PNG)

### Redux-saga中间件

- **index.js**使用配置

  ```js
  import { createStore, compose, applyMiddleware } from 'redux';
  import reducer from './reducer';
  import createSagaMiddleware from 'redux-saga';
  import todoSagas from './sagas'
  
  const sagaMiddleware = createSagaMiddleware()
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;
  const enhancer = composeEnhancers(applyMiddleware(sagaMiddleware));
  
  const store = createStore(reducer, enhancer);
  // sagaMiddleware运行sagas文件
  sagaMiddleware.run(todoSagas)
  
  export default store
  ```

- **sagas.js**一定要导出一个generator函数

  ```js
  import { takeEvery, put } from 'redux-saga/effects';
  import { GET_INIT_LIST } from './actionTypes';
  import axios from 'axios';
  import { initListAction } from './actionCreator'
  
  function* getInitList() {
    // generator对异步请求要用yield等待获取res
    // 通过try catch语句捕获错误
    try {
      const res = yield axios.get('/api/todolist');
      const action = initListAction(res.data)
      // !! yield put()
      yield put(action)
    } catch (e) {
      console.log('todoList 网络请求失败')
    }
  }
  
  // generator 函数
  function* mySaga() {
    // sagas文件通过takeEvery捕获action，执行对应的方法
    yield takeEvery(GET_INIT_LIST, getInitList)
  }
  
  export default mySaga;
  ```

- **reducer**获取action更改state

  ```js
  import { INIT_LIST_ACTION } from './actionTypes'
  
  const defaultState = {
      inputValue: '',
      list: []
  }
  
  export default (state = defaultState, action) => {
      if (action.type === INIT_LIST_ACTION) {
          const newState = JSON.parse(JSON.stringify(state))
          newState.list = action.data
          return newState
      }
      return state
  }
  ```

### React-Redux

- Provider：将对应store提供给其内部的所有组件

  ```js
  import React from 'react';
  import ReactDOM from 'react-dom';
  import TodoList from './TodoList';
  import { Provider } from 'react-redux';
  import store from './store';
  
  const App = (
      <Provider store={store}>
      <TodoList />
      </Provider>
  )
  
  ReactDOM.render(
      App,
      document.getElementById('root')
  );
  ```

- connect：将组件和store作连接（Provider内的组件）

  ```jsx
  import React, { Component } from 'react';
  import { connect } from 'react-redux';
  
  class TodoList extends Component {
      render() {
          return (
              <div>
                  <div>
                      <input
                          value={this.props.inputValue}
                          onChange={this.props.changeInputValue}
                          />
                      <button>提交</button>
                  </div>
                  <ul>
                      <li>123</li>
                  </ul>
              </div>
          )
      }
  }
  
  const mapStateToProps = (state) => {
      return {
          inputValue: state.inputValue,
          list: state.list
      }
  }
  
  // store.dispatch, props
  const mapDispatchToProps = (dispatch) => {
      return {
          changeInputValue(e) {
              const action = {
                  type: 'change_input_value',
                  value: e.target.value
              }
              dispatch(action)
          }
      }
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(TodoList)
  ```

- mapStateToProps：定义state数据映射到props的规则

- mapDispatchToProps：将store.dispatch方法映射到props上

#### demo

- TodoList

```jsx
import React from 'react';
import { connect } from 'react-redux';
import { getAddItemAction, getInputChangeAction, getDeleteItemAction } from './store/actionCreator'

const TodoList = (props) => {
  const { inputValue, list, handleClick, changeInputValue, handleDelete } = props
  return (
    <div>
      <div>
        <input value={inputValue} onChange={changeInputValue} />
        <button onClick={handleClick}>提交</button>
      </div>
      <ul>
        {
          list.map((item, index) => {
            // onCclick返回一个箭头函数执行，拿到正确index参数
            return <li onClick={() => (handleDelete(index))} key={index}>{item}</li>
          })
        }
      </ul>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    inputValue: state.inputValue,
    list: state.list
  }
}

// store.dispatch, props
const mapDispatchToProps = (dispatch) => {
  return {
    changeInputValue(e) {
      const action = getInputChangeAction(e.target.value)
      dispatch(action)
    },
    handleDelete(index) {
      const action = getDeleteItemAction(index)
      dispatch(action)
    },
    handleClick() {
      const action = getAddItemAction()
      dispatch(action)
    }
  }
}

// 将UI组件和数据方法结合，返回容器组件
export default connect(mapStateToProps, mapDispatchToProps)(TodoList)
```

- store/index.js

```
import { createStore } from 'redux';
import reducer from './reducer'

const store = createStore(reducer)

export default store;
```

- reducer

```js
import { CHANGE_INPUT_VALUE, ADD_ITEM, DELETE_ITEM } from './actionTypes'

const defaultState = {
  inputValue: 'hello world',
  list: []
}

export default (state = defaultState, action) => {
  if (action.type === CHANGE_INPUT_VALUE) {
    const newState = JSON.parse(JSON.stringify(state))
    newState.inputValue = action.value
    return newState
  }
  if (action.type === ADD_ITEM) {
    const newState = JSON.parse(JSON.stringify(state))
    newState.list.push(newState.inputValue)
    newState.inputValue = ''
    return newState
  }
  if (action.type === DELETE_ITEM) {
    const newState = JSON.parse(JSON.stringify(state))
    newState.list.splice(action.index, 1)
    return newState
  }
  return state
}
```

- actionTypes

```js
export const CHANGE_INPUT_VALUE = 'change_input_value'
export const ADD_ITEM = 'add_item'
export const DELETE_ITEM = 'delete_item'
```

- actionCreator

```js
import { CHANGE_INPUT_VALUE, ADD_ITEM, DELETE_ITEM } from './actionTypes'

export const getInputChangeAction = (value) => ({
  type: CHANGE_INPUT_VALUE,
  value
})

export const getDeleteItemAction = (index) => ({
  type: DELETE_ITEM,
  index
})

export const getAddItemAction = () => ({
  type: ADD_ITEM
})
```

