# JavaScript数据结构和算法

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
        // 每一次外循环之后，都能确定一个最大值
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
        // 每次内循环，遍历对比找到最小值的索引，所以每次都能确定一个最小值
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

### 插入排序

如果要将`[1,2,3,0]`数组当中的0移动到第一个位置，我们需要设置一个变量`temp`保存`arr[3]`；

然后从右向左遍历将所有数组项的索引右移一位，最后把`0temp赋值给`arr[0]`即可。

```js
const arr = [1,2,3,0];
let i = arr.length - 1;
let temp = arr[i];  // 0
while(i>0) {
    arr[i] = arr[i-1];
    i--;
}
arr[0] = temp;
console.log(arr);  // [0, 1, 2, 3]
```

插入排序每次排一个数组项，以此方式构建最后的排序数组。

```js
function insertSort(array) {
    const {
        length
    } = array
    let temp;

    for (let i = 1; i < length; i++) {
        let j = i;
        temp = array[j];
        while (j > 0 && array[j - 1] > temp) {
            array[j] = array[j - 1]
            j--;
        }
        array[j] = temp;
    }
    return array;
}
```

**注意**：在排序小型数组时，此算法比选择排序和冒泡排序性能要好

### 归并排序

📗 归并排序是第一个可以实际使用的排序算法，我们之前的三种算法性能不是特别的好，但归并排序性能不错，在`JavaScript`中，`Array.prototype.sort()`方法，`ECMAScript`并没有定义使用哪种排序算法，而是交给浏览器厂商自己去实现，而对于谷歌`V8引擎`，其使用了快速排序的变体；在`Firefox`浏览器中，则是使用了归并排序。

#### 实现

![](./img/mergeSort.png)

首先，假设我们有两个已经是排序过的数组，实现一个将这两个数组合并成一个的`merge`方法:

```js
function merge(left, right) {
    let i = 0;
    let j = 0;
    // 需要一个额外的数组空间保存结果
    const result = [];
    // 当left和right都还有未遍历项时
    while (i < left.length && j < right.length) {
        // 找到left和right当中的最小一项push到result,然后索引自增1
        result.push(left[i] > right[j] ? right[j++] : left[i++]);
    }
    // left如果已经遍历完, 将right连接到result,反之将left的剩余项连接到result
    // result.concat(i < left.length ? left.slice(i) : right.slice(j))
    return result.concat(i == left.length ? right.slice(j) : left.slice(i))
    
}

console.log(merge([1, 2], [0, 4]));  // [0, 1, 2, 4]
console.log(merge([2, 3, 5], [0, 4]));  // [0, 2, 3, 4, 5]
console.log(merge([1], [0]));  // [0, 1]
```

归并排序是一种分而治之的算法，其思想是将原始数组切分为较小的数组，直到每个小数组只有一个位置，接着将小数组归并成较大的数组，直到最后只有一个排序完毕的大数组。

```js
function mergeSort(array) {
    if (array.length > 1) {
        const { length } = array
        const middle = Math.floor(length / 2)
        const left = mergeSort(array.slice(0, middle))
        const right = mergeSort(array.slice(middle, length))
        array = merge(left, right)
    }
    return array
}

const result = mergeSort([8, 7, 6, 5, 4, 3, 2, 1])
console.log(result) // [1, 2, 3, 4, 5, 6, 7, 8]
```

#### 总结

- 归并排序是**稳定**排序，它也是一种十分高效的排序，能利用完全二叉树特性的排序一般性能都不会太差。从上文的图中可看出，每次合并操作的平均时间复杂度为O(n)，而完全二叉树的深度为|log2n|。总的平均时间复杂度为O(nlogn)。而且，归并排序的最好，最坏，平均时间复杂度均为O(nlogn)。
-  归并的空间复杂度就是那个临时的数组和递归时压入栈的数据占用的空间：n + logn；所以空间复杂度为: O(n)

### 快速排序

📗  快速排序也许是最常用的排序算法了。它的复杂度为O(nlog(n))，且性能通常比其他复杂度为O(nlog(n))的排序算法要好。和归并排序一样，快速排序也使用**分而治之**的方法，将原始数组分为较小的数组（但它没有像归并排序那样将它们分割开）。

::: tip 快速排序的思想很简单，整个排序过程只需要三步：

- 在数据集之中，选择一个元素作为"基准"（pivot）。
- 所有小于"基准"的元素，都移到"基准"的左边；所有大于"基准"的元素，都移到"基准"的右边。
- 对"基准"左边和右边的两个子集，不断重复第一步和第二步，直到所有子集只剩下一个元素为止。

::: 

#### 基本实现

```js
function quickSort(arr) {
    if (arr.length <= 1) { return arr; }
    var pivotIndex = Math.floor(arr.length / 2);
    var pivot = arr.splice(pivotIndex, 1)[0];
    var left = [];
    var right = [];
    for (var i = 0; i < arr.length; i++){
        if (arr[i] < pivot) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }
    return quickSort(left).concat([pivot], quickSort(right));
};
```

#### 双指针

```js
function quickSort(array, left, right) {
    let index;
    if (array.length > 1) {
        index = partition(array, left, right);
        if (left < index - 1) {
            quickSort(array, left, index - 1);
        }
        if (index < right) {
            quickSort(array, index, right);
        }
    }
    return array;
};

function partition(array, left, right) {
    const pivot = array[Math.floor((right + left) / 2)];
    let i = left;
    let j = right;

    while (i <= j) {
        while (array[i] < pivot) {
            i++;
        }
        while (array[j] > pivot) {
            j--;
        }
        if (i <= j) {
            toggleItem(array, i, j)
            i++;
            j--;
        }
    }
    return i;
}

const array = [9, 6, 7, 8, 2, 3, 5, 1]
console.table(quickSort(array, 0, array.length - 1))
```

