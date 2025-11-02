import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export class StringArrayName implements Name {
  protected delimiter: string = DEFAULT_DELIMITER;
  protected components: string[] = [];

  constructor(source: string[], delimiter?: string) {
    this.delimiter = delimiter ?? DEFAULT_DELIMITER;
    this.components = [...source];
  }

  public asString(delimiter: string = this.delimiter): string {
    return this.components.join(delimiter);
  }

  /** Optional: typically a serialization identical to asString() for this class */
  public asDataString(): string {
    return this.asString(this.delimiter);
  }

  public getDelimiterCharacter(): string {
    return this.delimiter;
  }

  public isEmpty(): boolean {
    return this.components.length === 0;
  }

  public getNoComponents(): number {
    return this.components.length;
  }

  public getComponent(i: number): string {
    this.assertIndexInRange(i);
    return this.components[i];
  }

  public setComponent(i: number, c: string): void {
    this.assertIndexInRange(i);
    this.components[i] = c;
  }

  public insert(i: number, c: string): void {
    this.assertIndexInRangeForInsert(i);
    this.components.splice(i, 0, c);
  }

  public append(c: string): void {
    this.components.push(c);
  }

  public remove(i: number): void {
    this.assertIndexInRange(i);
    this.components.splice(i, 1);
  }

  public concat(other: Name): void {
    for (let i = 0; i < other.getNoComponents(); i++) {
      this.components.push(other.getComponent(i));
    }
  }

  private assertIndexInRange(i: number): void {
    if (!Number.isInteger(i) || i < 0 || i >= this.components.length) {
      throw new RangeError(`index ${i} out of range`);
    }
  }

  private assertIndexInRangeForInsert(i: number): void {
    if (!Number.isInteger(i) || i < 0 || i > this.components.length) {
      throw new RangeError(`insert index ${i} out of range`);
    }
  }
}
