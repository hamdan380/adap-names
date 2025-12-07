import { Node } from "./Node";

export class Directory extends Node {
  protected childNodes: Set<Node> = new Set<Node>();

  constructor(bn: string, pn: Directory) {
    super(bn, pn);
  }

  public hasChildNode(cn: Node): boolean {
    return this.childNodes.has(cn);
  }

  public addChildNode(cn: Node): void {
    this.childNodes.add(cn);
  }

  public removeChildNode(cn: Node): void {
    this.childNodes.delete(cn); // Yikes! Should have been called remove
  }

  /**
   * Returns all nodes in this directory's subtree
   * whose base name equals bn.
   *
   * Uses Node.findNodes for this directory itself,
   * then recurses into child nodes.
   */
  public override findNodes(bn: string): Set<Node> {
    const result = new Set<Node>();

    // 1) matches at this directory (and invariant checks)
    const localMatches = super.findNodes(bn);
    for (const n of localMatches) {
      result.add(n);
    }

    // 2) recurse into all child nodes
    for (const child of this.childNodes) {
      const childMatches = child.findNodes(bn);
      for (const n of childMatches) {
        result.add(n);
      }
    }

    return result;
  }
}
