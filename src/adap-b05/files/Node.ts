import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { ServiceFailureException } from "../common/ServiceFailureException";

import { Name } from "../names/Name";
import { Directory } from "./Directory";

export class Node {
  protected baseName: string = "";
  protected parentNode: Directory;

  constructor(bn: string, pn: Directory) {
    this.doSetBaseName(bn);
    this.parentNode = pn; // why oh why do I have to set this
    this.initialize(pn);
  }

  protected initialize(pn: Directory): void {
    this.parentNode = pn;
    this.parentNode.addChildNode(this);
  }

  public move(to: Directory): void {
    this.parentNode.removeChildNode(this);
    to.addChildNode(this);
    this.parentNode = to;
  }

  public getFullName(): Name {
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

  public rename(bn: string): void {
    this.doSetBaseName(bn);
  }

  protected doSetBaseName(bn: string): void {
    this.baseName = bn;
  }

  public getParentNode(): Directory {
    return this.parentNode;
  }

  /**
   * Class invariant for "normal" nodes (non-root):
   *  - parentNode must not be null/undefined
   *  - baseName must NOT be empty
   *
   * RootNode will override this to relax the basename rule.
   */
  protected checkInvariant(): void {
    if (this.parentNode == null) {
      throw new InvalidStateException(
        "Node invariant violated: parentNode must not be null",
      );
    }
    if (this.baseName === "") {
      throw new InvalidStateException(
        "Node invariant violated: baseName must not be empty",
      );
    }
  }

  /**
   * Returns all nodes in the tree that match bn.
   *
   * For a non-directory node, this is either:
   *  - { this } if this.getBaseName() === bn
   *  - empty set otherwise
   *
   * Precondition:
   *  - bn must not be null or undefined
   *
   * Error handling:
   *  - If the node is in an invalid state (violates invariant),
   *    throw a ServiceFailureException with an InvalidStateException as trigger.
   */
  public findNodes(bn: string): Set<Node> {
    if (bn == null) {
      throw new IllegalArgumentException("basename must not be null");
    }

    try {
      // Calling getBaseName() may trigger the injected fault in BuggyFile
      const myBaseName = this.getBaseName();

      // After that, we verify the invariant (which will now see the corruption)
      this.checkInvariant();

      const result = new Set<Node>();
      if (myBaseName === bn) {
        result.add(this);
      }
      return result;
    } catch (e) {
      if (e instanceof InvalidStateException) {
        // Wrap invalid state into a service failure, as the test hints
        throw new ServiceFailureException(
          "file system node in invalid state",
          e,
        );
      }
      throw e;
    }
  }
}
