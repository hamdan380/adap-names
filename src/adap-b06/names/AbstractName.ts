import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { Name } from "./Name";

/**
 * B06: Immutable value-object base class for Name implementations.
 *
 * Subclasses only need to provide:
 *  - getNoComponents()
 *  - getComponent(i)
 *  - withComponents(newComponents): Name   (factory method)
 *
 * All "mutation" operations return a NEW Name.
 */
export abstract class AbstractName implements Name {
  protected readonly delimiter: string;

  constructor(delimiter: string = DEFAULT_DELIMITER) {
    if (delimiter == null) throw new IllegalArgumentException("delimiter must not be null");
    if (delimiter.length !== 1) throw new IllegalArgumentException("delimiter must be a single character");
    this.delimiter = delimiter;
  }

  public getDelimiterCharacter(): string {
    return this.delimiter;
  }

  public isEmpty(): boolean {
    return this.getNoComponents() === 0;
  }

  // ---------- immutability: all return new objects ----------

  public setComponent(i: number, c: string): Name {
    this.assertMaskedComponent(c, this.delimiter);
    const parts = this.copyComponents();
    this.assertIndex(i, parts.length);
    parts[i] = c;
    return this.withComponents(parts);
  }

  public insert(i: number, c: string): Name {
    this.assertMaskedComponent(c, this.delimiter);
    const parts = this.copyComponents();
    if (!Number.isInteger(i) || i < 0 || i > parts.length) {
      throw new IllegalArgumentException("index out of range");
    }
    parts.splice(i, 0, c);
    return this.withComponents(parts);
  }

  public append(c: string): Name {
    this.assertMaskedComponent(c, this.delimiter);
    const parts = this.copyComponents();
    parts.push(c);
    return this.withComponents(parts);
  }

  public remove(i: number): Name {
    const parts = this.copyComponents();
    this.assertIndex(i, parts.length);
    parts.splice(i, 1);
    return this.withComponents(parts);
  }

  public concat(other: Name): Name {
    if (other == null) throw new IllegalArgumentException("other must not be null");
    const parts = this.copyComponents();
    for (let i = 0; i < other.getNoComponents(); i++) {
      parts.push(other.getComponent(i));
    }
    return this.withComponents(parts);
  }

  // ---------- Printable ----------

  public asString(delimiter: string = this.delimiter): string {
    if (delimiter == null) throw new IllegalArgumentException("delimiter must not be null");
    if (delimiter.length !== 1) throw new IllegalArgumentException("delimiter must be a single character");

    const rawParts = this.copyComponents().map((m) => AbstractName.unescape(m));
    return rawParts.join(delimiter);
  }

  public asDataString(): string {
    // Machine-readable: always default delimiter and escaping rules
    const rawParts = this.copyComponents().map((m) => AbstractName.unescape(m));
    const escapedParts = rawParts.map((r) => AbstractName.escapeForDelimiter(r, DEFAULT_DELIMITER));
    return escapedParts.join(DEFAULT_DELIMITER);
  }

  public toString(): string {
    return this.asDataString();
  }

  // ---------- Equality contract ----------

    public isEqual(other: Object): boolean {
    if (other == null) return false;

    // Duck-typing check (because Name is an interface, not a runtime class)
    const o: any = other as any;
    const isNameLike =
      typeof o.getDelimiterCharacter === "function" &&
      typeof o.getNoComponents === "function" &&
      typeof o.getComponent === "function";

    if (!isNameLike) return false;

    if (this.getDelimiterCharacter() !== o.getDelimiterCharacter()) return false;
    if (this.getNoComponents() !== o.getNoComponents()) return false;

    for (let i = 0; i < this.getNoComponents(); i++) {
      if (this.getComponent(i) !== o.getComponent(i)) return false;
    }
    return true;
  }


  public getHashCode(): number {
    // Simple stable hash: combine delimiter + components.
    // Equal objects -> same hash. Not necessarily unique (that's fine).
    let h = 17;
    h = AbstractName.hashStep(h, this.getDelimiterCharacter());
    for (let i = 0; i < this.getNoComponents(); i++) {
      h = AbstractName.hashStep(h, this.getComponent(i));
    }
    return h;
  }

  // ---------- subclass API ----------

  abstract getNoComponents(): number;
  abstract getComponent(i: number): string;

  /**
   * Factory method: subclasses must return a NEW instance containing exactly these masked components
   * and using the same delimiter as this instance.
   */
  protected abstract withComponents(components: string[]): Name;

  // ---------- helpers ----------

  protected copyComponents(): string[] {
    const parts: string[] = [];
    for (let i = 0; i < this.getNoComponents(); i++) parts.push(this.getComponent(i));
    return parts;
  }

  protected assertIndex(i: number, n: number): void {
    if (!Number.isInteger(i)) throw new IllegalArgumentException("index must be integer");
    if (i < 0 || i >= n) throw new IllegalArgumentException("index out of range");
  }

  /**
   * Validates that a masked component contains no unescaped delimiter and no dangling escape.
   */
  protected assertMaskedComponent(masked: string, delimiter: string): void {
    if (typeof masked !== "string") throw new IllegalArgumentException("component must be a string");
    AbstractName.validateMasked(masked, delimiter);
  }

  /** Unescape masked component: turns '\x' into 'x' */
  protected static unescape(masked: string): string {
    let result = "";
    for (let i = 0; i < masked.length; i++) {
      const ch = masked[i];
      if (ch === ESCAPE_CHARACTER) {
        i++;
        if (i < masked.length) result += masked[i];
      } else {
        result += ch;
      }
    }
    return result;
  }

  /** Escape raw component for given delimiter: escape '\' and delimiter */
  protected static escapeForDelimiter(raw: string, delimiter: string): string {
    let result = "";
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (ch === ESCAPE_CHARACTER || ch === delimiter) result += ESCAPE_CHARACTER;
      result += ch;
    }
    return result;
  }

  protected static validateMasked(masked: string, delimiter: string): void {
    for (let i = 0; i < masked.length; i++) {
      const ch = masked[i];
      if (ch === ESCAPE_CHARACTER) {
        i++;
        if (i >= masked.length) throw new InvalidStateException("dangling escape in component");
        continue;
      }
      if (ch === delimiter) throw new InvalidStateException("unmasked delimiter in component");
    }
  }

  private static hashStep(h: number, s: string): number {
    let x = h * 31;
    for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0;
    return x;
  }
}
