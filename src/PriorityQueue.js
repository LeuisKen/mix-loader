export default class PriorityQueue {
	constructor (cmp = (a, b) => a.toString() < b.toString() ? -1 : 1 ) {
		this.cmp = cmp;
		this.queue = [];
	}
	get length () {
		return this.queue.length;
	}
	_push (val) {
		const { queue, cmp } = this;
		// 要加入的元素的角标作为当前元素
		let cur = queue.length;
		const ret = queue.push(val);
		// 当前元素不为根节点
		while(cur) {
			// 获取父节点角标, 等价于Math.floor((cur - 1) / 2)
			const parent = (cur - (cur & 1 ? 1 : 2)) / 2;
			// 当前元素比父元素大, 小顶堆恢复
			if(cmp(queue[parent], queue[cur]) <= 0) break;
			// 否则继续交换直到恢复小顶堆
			[queue[cur], queue[parent]] = [queue[parent], queue[cur]];
			cur = parent;
		}
		return ret;
	}
	front () {
		return this.queue[0];
	}
	push(...args) {
		args.forEach(val => this._push(val));
	}
	pop () {
		const { queue, cmp } = this;
		// 顶部元素与最后一个元素交换
		const last = queue.length - 1;
		if(last < 1) return queue.pop();
		[queue[0], queue[last]] = [queue[last], queue[0]];

		let cur = 0, left = 2 * cur + 1, right = left + 1;
		// 当前元素还有儿子(即当前元素不是叶子节点)
		while(left < last) {
			// 取较小的一个儿子的角标
			let target = left;
			if( right < last && cmp(queue[right], queue[left]) < 0) target = right;

			// 当前元素比子元素小, 小顶堆恢复
			if(cmp(queue[cur], queue[target]) <= 0) break;
			// 否则继续交换
			[queue[cur], queue[target]] = [queue[target], queue[cur]];
			cur = target;
			left = 2 * cur + 1;
			right = left + 1;
		}
		return queue.pop();
	}
	// 由于操作会影响内部存储, 移除迭代器特性
	// *[Symbol.iterator] () {
	// 	while(this.length) yield this.pop();
	// }
}