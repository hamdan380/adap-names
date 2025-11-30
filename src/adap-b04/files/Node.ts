import { Name } from "../names/Name";
import { Directory } from "./Directory";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";

export class Node {
  protected baseName: string = "";
  protected parentNode: Directory;

  /**
   * Create a new node with given base name and parent directory.
   *
   * Preconditions:
   *  - bn must be a string (may be empty, e.g. for RootNode)
   *  - pn must not be null/undefined
   */
  constructor(bn: string, pn: Directory) {
    if (pn == null) {
      throw new IllegalArgumentException("Parent directory must not be null");
    }
    this.doSetBaseName(bn);
    this.parentNode = pn; // needed so initialize can use it
    this.initialize(pn);
    this.checkInvariant();
  }

  /**
   * Connect this node to its parent directory.
   *
   * Preconditions:
   *  - pn must not be null
   */
  protected initialize(pn: Directory): void {
    if (pn == null) {
      throw new IllegalArgumentException("Parent directory must not be null");
    }
    this.parentNode = pn;
    this.parentNode.addChildNode(this);
  }

  /**
   * Move this node from its current parent directory to another directory.
   *
   * Preconditions:
   *  - to must not be null
   *  - this.parentNode must not be null (invariant)
   */
  public move(to: Directory): void {
    if (to == null) {
      throw new IllegalArgumentException("Target directory must not be null");
    }
    this.checkInvariant();

    this.parentNode.removeChildNode(this);
    to.addChildNode(this);
    this.parentNode = to;

    this.checkInvariant();
  }

  /**
   * Compute the full name of this node:
   *  - parent's full name
   *  - plus this node's base name as last component
   *
   * Preconditions:
   *  - parentNode must not be null
   */
  public getFullName(): Name {
    this.checkInvariant();
    const result: Name = this.parentNode.getFullName();
    result.append(this.getBaseName());
    return result;
  }

  public getBaseName(): string {
    return this.doGetBaseName();
  }

  protected doGetBaseName(): string {
    return this.baseName;
  }

  /**
   * Rename this node.
   *
   * Preconditions:
   *  - bn must be a string (may be empty)
   */
  public rename(bn: string): void {
    this.doSetBaseName(bn);
    this.checkInvariant();
  }

  /**
   * Set the base name without changing the directory structure.
   *
   * Preconditions:
   *  - bn must be a string (may be empty)
   */
  protected doSetBaseName(bn: string): void {
    if (typeof bn !== "string") {
      throw new IllegalArgumentException("Base name must be a string");
    }
    this.baseName = bn;
  }

  public getParentNode(): Directory {
    this.checkInvariant();
    return this.parentNode;
  }

  /**
   * Class invariant for Node:
   *  - parentNode must not be null/undefined
   *  - baseName must be a string (can be empty e.g. for root)
   */
  protected checkInvariant(): void {
    if (this.parentNode == null) {
      throw new InvalidStateException(
        "Node invariant violated: parentNode must not be null",
      );
    }
    if (typeof this.baseName !== "string") {
      throw new InvalidStateException(
        "Node invariant violated: baseName must be a string",
      );
    }
  }
}
