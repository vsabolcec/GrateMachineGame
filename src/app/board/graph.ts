import { prependListener } from "process";
import { StringDecoder } from "string_decoder";

export interface Node {
  x: number;
  y: number;
  side?: number;
};

class UnionFind {
  private parents: Map<number, number> = new Map();

  find(u: Node): Node {
    return numberToNode(this.findInternal(nodeToNumber(u)));
  }

  join(u: Node, v: Node) {
    this.joinInternal(nodeToNumber(u), nodeToNumber(v));
  }

  connected(u: Node, v: Node): boolean {
    return this.findInternal(nodeToNumber(u)) === this.findInternal(nodeToNumber(v));
  }

  private findInternal(u: number): number {
    const parent = this.parents.get(u);
    if (parent == u) return u;
    const rootParent = this.findInternal(parent);
    this.parents.set(u, rootParent);
    return rootParent;
  }

  private joinInternal(u: number, v: number) {
    if (this.parents.get(u) === undefined) this.parents.set(u, u);
    if (this.parents.get(v) === undefined) this.parents.set(v, v);
    u = this.findInternal(u);
    v = this.findInternal(v);
    if (Math.random() < 0.5) {
      this.parents.set(u, v);
    } else {
      this.parents.set(v, u);
    }
  }
};

export class Graph {
  private unionFind: UnionFind = new UnionFind();

  join(u: Node, v: Node) {
    this.unionFind.join(u, v);
  }

  connected(u: Node, v: Node): boolean {
    return this.unionFind.connected(u, v);
  }
};


function nodeToNumber(node: Node): number {
  let ret = node.x;
  ret *= 20;
  ret += node.y;
  ret *= 20;
  ret += (node.side === undefined) ? 5 : node.side;
  return ret;
}

function numberToNode(num: number): Node {
  const side = num % 20;
  num = Math.floor(num / 20);
  const y = num % 20;
  num = Math.floor(num / 20);
  const x = num;
  if (side === 5) return { x, y };
  return { x, y, side };
}