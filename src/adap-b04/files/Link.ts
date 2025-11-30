import { Node } from "./Node";
import { Directory } from "./Directory";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";

/**
 * Link:
 *  - A Node that refers to another Node (its target).
 *  - May initially be dangling (no target).
 *  - Operations that require a target use ensureTargetNode().
 */
export class Link extends Node {
  protected targetNode: Node | null = null;

  /**
   * Create a link with a base name, parent directory and optional target.
   *
   * Preconditions:
   *  - pn must not be null (enforced by Node)
   *  - bn must be a string (enforced by Node)
   */
  constructor(bn: string, pn: Directory, tn?: Node) {
    super(bn, pn);

    if (tn !== undefined) {
      this.targetNode = tn;
    }

    this.checkInvariant();
  }

  /**
   * Returns the current target (may be null if link is dangling).
   */
  public getTargetNode(): Node | null {
    this.checkInvariant();
    return this.targetNode;
  }

  /**
   * Set the target of this link.
   *
   * Preconditions:
   *  - target must not be null/undefined
   */
  public setTargetNode(target: Node): void {
    if (target == null) {
      throw new IllegalArgumentException("Target node must not be null");
    }
    this.targetNode = target;
    this.checkInvariant();
  }

  /**
   * Base name of a link is defined as the base name of its target.
   *
   * Preconditions:
   *  - link must have a non-null target
   */
  public override getBaseName(): string {
    this.checkInvariant();
    const target = this.ensureTargetNode(this.targetNode);
    return target.getBaseName();
  }

  /**
   * Renaming a link delegates to renaming its target.
   *
   * Preconditions:
   *  - link must have a non-null target
   */
  public override rename(bn: string): void {
    this.checkInvariant();
    const target = this.ensureTargetNode(this.targetNode);
    target.rename(bn);
  }

  /**
   * Ensure that this link has a valid target for operations that require one.
   *
   * Preconditions:
   *  - target must not be null, otherwise InvalidStateException is thrown.
   */
  protected ensureTargetNode(target: Node | null): Node {
    if (target == null) {
      throw new InvalidStateException(
        "Link invariant violated: target node is required for this operation",
      );
    }
    return target;
  }

  /**
   * Invariant for Link:
   *  - Node invariant holds (parent not null, basename is string)
   *  - targetNode may be null (dangling link is allowed), but if not null it must be a Node
   */
  protected override checkInvariant(): void {
    super.checkInvariant();
    if (this.targetNode !== null && !(this.targetNode instanceof Node)) {
      throw new InvalidStateException(
        "Link invariant violated: targetNode must be a Node or null",
      );
    }
  }
}
