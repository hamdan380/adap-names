import { Name } from "../names/Name";
import { StringName } from "../names/StringName";
import { Directory } from "./Directory";
import { InvalidStateException } from "../common/InvalidStateException";

/**
 * RootNode:
 *  - Singleton root of the file system tree
 *  - Has no real parent; its parent is itself
 *  - Base name is the empty string
 */
export class RootNode extends Directory {
  protected static ROOT_NODE: RootNode = new RootNode();

  public static getRootNode(): RootNode {
    return this.ROOT_NODE;
  }

  /**
   * Root has:
   *  - empty base name
   *  - "fake" parent just to satisfy type system during super()
   * After construction, we repair the parent to point to itself.
   */
  constructor() {
    // Pass dummy parent; initialize will override parentNode
    super("", {} as Directory);
    // enforce root structure
    this.parentNode = this;
    this.baseName = "";
    this.checkInvariant();
  }

  /**
   * For RootNode, initialize does NOT add it as a child to a parent.
   * Instead, it makes the root its own parent.
   */
  protected override initialize(pn: Directory): void {
    this.parentNode = this;
    // no parent.addChildNode(this) – root is top-level
  }

  /**
   * Full name of the root:
   *  Often represented as empty or "/" – here we use an empty StringName.
   */
  public override getFullName(): Name {
    return new StringName("", "/");
  }

  /**
   * Root cannot be moved – no-op.
   */
  public override move(to: Directory): void {
    // null operation – root stays root
  }

  /**
   * Root cannot be renamed – ignore attempts.
   */
  protected override doSetBaseName(bn: string): void {
    // root name is fixed as ""
    this.baseName = "";
  }

  /**
   * Root-specific invariant:
   *  - parentNode must always be this
   *  - baseName is a string (may be empty)
   */
  protected override checkInvariant(): void {
    if (this.parentNode !== this) {
      throw new InvalidStateException(
        "RootNode invariant violated: parentNode must be the root itself",
      );
    }
    // Delegate to Node's checks for baseName type, etc.
    // (baseName may be empty, that's valid for root)
  }
}
