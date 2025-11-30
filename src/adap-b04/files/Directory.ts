import { Node } from "./Node";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { MethodFailedException } from "../common/MethodFailedException";

export class Directory extends Node {
  protected childNodes: Set<Node> = new Set<Node>();

  /**
   * Create a directory with the given base name and parent directory.
   *
   * Preconditions are already partially enforced by Node:
   *  - bn must be a non-empty string
   *  - pn must not be null
   */
  constructor(bn: string, pn: Directory) {
    super(bn, pn);
  }

  /**
   * Check if a given child node is contained in this directory.
   *
   * Precondition:
   *  - cn must not be null/undefined
   */
  public hasChildNode(cn: Node): boolean {
    if (cn == null) {
      throw new IllegalArgumentException("Child node must not be null");
    }
    return this.childNodes.has(cn);
  }

  /**
   * Add a child node to this directory.
   *
   * Preconditions:
   *  - cn must not be null/undefined
   *
   * Postcondition:
   *  - hasChildNode(cn) must be true afterwards
   */
  public addChildNode(cn: Node): void {
    if (cn == null) {
      throw new IllegalArgumentException("Child node must not be null");
    }

    this.childNodes.add(cn);

    if (!this.childNodes.has(cn)) {
      throw new MethodFailedException(
        "addChildNode postcondition violated: child not present after add",
      );
    }
  }

  /**
   * Remove a child node from this directory.
   *
   * Preconditions:
   *  - cn must not be null/undefined
   *
   * Postcondition:
   *  - hasChildNode(cn) must be false afterwards
   */
  public removeChildNode(cn: Node): void {
    if (cn == null) {
      throw new IllegalArgumentException("Child node must not be null");
    }

    this.childNodes.delete(cn);

    if (this.childNodes.has(cn)) {
      throw new MethodFailedException(
        "removeChildNode postcondition violated: child still present after remove",
      );
    }
  }
}
