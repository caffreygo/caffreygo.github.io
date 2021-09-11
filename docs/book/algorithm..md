## JavaScript数据结构和算法

## 排序和搜索算法

### 冒泡排序

::: tip 冒泡排序
* 冒泡排序是比较相邻的两个项，如果第一个比第二个大，则交换它们。
* 元素项向上移动至正确的顺序，就好像气泡升至表面一样，冒泡排序因此而得名。
* 冒泡排序可能是所有排序算法中最简单的，但从运行时间的角度而言，冒泡排序是最差的一个。

::: 

```js
function toggleItem(array, index1, index2) {
    [array[index1], array[index2]] = [array[index2], array[index1]];
}
function bubbleSort(arr) {
    const { length } = arr
    for (let i = 0; i < length; i++) {
        for (let j = 0; j < length - 1 - i; j++) {
            // 每次内循环，间隔对比找到最大的值，放到后面
            // 如果前者比后者大，调换位置达到从小到大的效果
            if (arr[j] > arr[j + 1]) toggleItem(arr, j, j + 1)
        }
    }
    return arr
}
```

### 选择排序

::: tip 选择排序

  * 选择排序算法是一种原址比较排序算法。
  * 选择排序大致的思路是找到数据结构中的最小值并将其放置在第一位，接着找到第二小的值将其放在第二位，以此类推。

::: 

```js
function selectSort(arr) {
    const { length } = arr
    let minIndex;
    for (let i = 0; i < length; i++) {
        minIndex = i;
        // 每次内循环，遍历对比找到最小值的索引
        for (let j = i + 1; j < length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j
            }
        }
        // 如果找到比当前开始数值更小的索引，交换位置
        if (minIndex !== i) {
            toggleItem(arr, i, minIndex)
        }
    }
    return arr
}
```

