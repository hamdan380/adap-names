import { Name } from "../names/Name";
import { StringName } from "../names/StringName";
import { Directory } from "./Directory";
import { InvalidStateException } from "../common/InvalidStateException";

export class RootNode extends Directory {
  protected static ROOT_NODE: RootNode = new RootNode();

  public static getRootNode() {
    return this.ROOT_NODE;
  }

  constructor() {
    super("", (new Object() as Directory));
  }

  protected initialize(pn: Directory): void {
    this.parentNode = this;
  }

  public getFullName(): Name {
    return new StringName("", "/");
  }

  public move(to: Directory): void {
    // null operation
  }

  protected doSetBaseName(bn: string): void {
    // null operation (root's base name stays "")
  }

  /**
   * Root invariant:
   *  - parentNode must always be the root itself
   *  - basename may be empty for root
   */
  protected override checkInvariant(): void {
    if (this.parentNode !== this) {
      throw new InvalidStateException(
        "RootNode invariant violated: parentNode must be the root itself",
      );
    }
  }
}
