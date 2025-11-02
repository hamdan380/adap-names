import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export class StringName implements Name {
  protected delimiter: string = DEFAULT_DELIMITER;
  protected name: string = "";
  protected noComponents: number = 0;

  constructor(source: string, delimiter?: string) {
    this.delimiter = delimiter ?? DEFAULT_DELIMITER;
    this.name = source ?? "";

    if (this.name === "") {
      this.noComponents = 0;
    } else if (this.name.includes(this.delimiter)) {
      this.noComponents = this.name.split(this.delimiter).length;
    } else {
      this.noComponents = 1;
    }
  }

  public asString(delimiter: string = this.delimiter): string {
    if (this.noComponents === 0) return "";
    const components = this.name.includes(this.delimiter)
      ? this.name.split(this.delimiter)
      : [this.name];
    return components.join(delimiter);
  }

  public asDataString(): string {
    return this.asString(this.delimiter);
  }

  public getDelimiterCharacter(): string {
    return this.delimiter;
  }

  public isEmpty(): boolean {
    return this.noComponents === 0;
  }

  public getNoComponents(): number {
    return this.noComponents;
  }

  public getComponent(i: number): string {
    const components = this.getComponents();
    this.checkIndex(i, components);
    return components[i];
  }

  public setComponent(n: number, c: string): void {
    const components = this.getComponents();
    this.checkIndex(n, components);
    components[n] = c;
    this.updateName(components);
  }

  public insert(n: number, c: string): void {
    const components = this.getComponents();
    this.checkInsertIndex(n, components);
    components.splice(n, 0, c);
    this.updateName(components);
  }

  public append(c: string): void {
    const components = this.getComponents();
    components.push(c);
    this.updateName(components);
  }

  public remove(n: number): void {
    const components = this.getComponents();
    this.checkIndex(n, components);
    components.splice(n, 1);
    this.updateName(components);
  }

  public concat(other: Name): void {
    const components = this.getComponents();
    for (let i = 0; i < other.getNoComponents(); i++) {
      components.push(other.getComponent(i));
    }
    this.updateName(components);
  }

  private getComponents(): string[] {
    if (this.noComponents === 0) return [];
    return this.name.includes(this.delimiter)
      ? this.name.split(this.delimiter)
      : [this.name];
  }

  private updateName(components: string[]): void {
    if (components.length === 0) {
      this.name = "";
      this.noComponents = 0;
    } else {
      this.name = components.join(this.delimiter);
      this.noComponents = components.length;
    }
  }

  private checkIndex(i: number, components: string[]): void {
    if (!Number.isInteger(i) || i < 0 || i >= components.length) {
      throw new RangeError(`index ${i} out of range`);
    }
  }

  private checkInsertIndex(i: number, components: string[]): void {
    if (!Number.isInteger(i) || i < 0 || i > components.length) {
      throw new RangeError(`insert index ${i} out of range`);
    }
  }
}
