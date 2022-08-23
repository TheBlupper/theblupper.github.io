/*
This file uses Dijkstra's algorithm to find a good way
to construct the numbers we need from the numbers we have
using the operations we have
*/


// https://stackoverflow.com/a/66511107/11239740
const MinHeap={siftDown(h,i=0,v=h[i]){if(i<h.length){let k=v[0];while(1){let j=i*2+1;if(j+1<h.length&&h[j][0]>h[j+1][0])j++;if(j>=h.length||k<=h[j][0])break;h[i]=h[j];i=j;}h[i]=v}},heapify(h){for(let i=h.length>>1;i--;)this.siftDown(h,i);return h},pop(h){return this.exchange(h,h.pop())},exchange(h,v){if(!h.length)return v;let w=h[0];this.siftDown(h,0,v);return w},push(h,v){let k=v[0],i=h.length,j;while((j=(i-1)>>1)>=0&&k<h[j][0]){h[i]=h[j];i=j}h[i]=v;return h}};

const ops = [
    {
        f: (a, b) => a + b,
        symbol: "+",
        commutative: true
    },
    {
        f: (a, b) => a - b,
        symbol: "-",
        commutative: false
    }
];
const predefined = [0, 1, 3, 43, 45];
// atm operations is the only thing that can happen so not
// really necessary but might make for example defining
// new operations available later
const opcost = 22;

class Node {
    constructor(n, available, path) {
        this.n = n;
        this.available = available.concat(n);
        this.path = path;
    }

    neighbors() {
        const res = [];
        ops.forEach(op => {
            this.available.forEach(b => {
                const argss = [[this.n, b]];
                if (!op.commutative)
                    argss.push([b, this.n])

                // Top-tier variable names ik
                argss.forEach(args => {
                    let n = op.f(...args);
                    res.push([opcost,
                        new Node(
                            n,
                            this.available,
                            this.path.concat({ op, args, n})
                    )]);
                });
            });
        });
        return res;
    }
}


function dijkstra(nums) {
    const max = 256;

    let left = nums.slice();
    let root = new Node(0, predefined, []);
    // Perform Dijkstras algorithm over and over until
    // all the required numbers are found. Each time
    // it picks one of the numbers we need which has
    // the lowest cost to reach. This is not optimal
    // by any means
    while (left.length) {
        const dist = new Array(max).fill(Infinity);
        dist[root.n] = 0;
        let paths = new Array(max);
        let pq = [[0, root]];
        while (pq.length) {
            let [_, curr] = MinHeap.pop(pq);
            curr.neighbors().forEach(i => {
                let [cost, other] = i; 
                if (dist[curr.n] + cost < dist[other.n]){
                    dist[other.n] = dist[curr.n] + cost
                    paths[other.n] = other
                    MinHeap.push(pq, [dist[other.n], other])
                }
            })
        }
        left = nums.filter((n)=>!root.available.includes(n));
        if (left.length)
            root = paths[left.reduce((prev, curr) => {
                return dist[prev] < dist[curr] ? prev: curr;
            })];
    }
    return root.path
}