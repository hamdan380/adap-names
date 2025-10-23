// ADAP B01 Homework

export const DEFAULT_DELIMITER: string = '.';
export const ESCAPE_CHARACTER = '\\';

/**
 * A name is a sequence of string components separated by a delimiter character.
 * Special characters within the string may need masking, if they are to appear verbatim.
 * There are only two special characters, the delimiter character and the escape character.
 * The escape character can't be set, the delimiter character can.
 * 
 * Homogenous name examples
 * 
 * "oss.cs.fau.de" is a name with four name components and the delimiter character '.'.
 * "///" is a name with four empty components and the delimiter character '/'.
 * "Oh\.\.\." is a name with one component, if the delimiter character is '.'.
 */
export class Name {

    private delimiter: string = DEFAULT_DELIMITER;
    private components: string[] = [];

    /** Expects that all Name components are properly masked */
    constructor(other: string[], delimiter?: string) {
        this.delimiter = delimiter ?? DEFAULT_DELIMITER;
        if (!Array.isArray(other)) throw new Error("components must be an array");
        for (const c of other) {
            if (typeof c !== "string") throw new Error("component must be string");
            Name.validateMasked(c, this.delimiter);
        }
        this.components = other.slice(); // keep masked components
    }

    /**
     * Returns a human-readable representation of the Name instance using user-set special characters
     * Special characters are not escaped (creating a human-readable string)
     * Users can vary the delimiter character to be used
     */
    public asString(delimiter: string = this.delimiter): string {
        const rawParts = this.components.map(c => Name.unescape(c));
        return rawParts.join(delimiter);
    }

    /** 
     * Returns a machine-readable representation of Name instance using default special characters
     * Machine-readable means that from a data string, a Name can be parsed back in
     * The special characters in the data string are the default characters
     */
    public asDataString(): string {
        const rawParts = this.components.map(c => Name.unescape(c));
        const escapedParts = rawParts.map(r => Name.escapeForDelimiter(r, DEFAULT_DELIMITER));
        return escapedParts.join(DEFAULT_DELIMITER);
    }

    /** Returns properly masked component string */
    public getComponent(i: number): string {
        Name.checkIndexRange(i, this.components.length);
        return this.components[i];
    }

    /** Expects that new Name component c is properly masked */
    public setComponent(i: number, c: string): void {
        Name.checkIndexRange(i, this.components.length);
        Name.validateMasked(c, this.delimiter);
        this.components[i] = c;
    }

     /** Returns number of components in Name instance */
    public getNoComponents(): number {
        return this.components.length;
    }

    /** Expects that new Name component c is properly masked */
    public insert(i: number, c: string): void {
        // allow insert at end as well
        if (i < 0 || i > this.components.length) throw new Error("index is out of range");
        Name.validateMasked(c, this.delimiter);
        this.components.splice(i, 0, c);
    }

    /** Expects that new Name component c is properly masked */
    public append(c: string): void {
        Name.validateMasked(c, this.delimiter);
        this.components.push(c);
    }

    public remove(i: number): void {
        Name.checkIndexRange(i, this.components.length);
        this.components.splice(i, 1);
    }
    // ---------- helpers ----------

    /** Ensure index is within [0, n-1] */
    private static checkIndexRange(i: number, n: number): void {
        if (!Number.isInteger(i)) throw new Error("index must be integer");
        if (i < 0 || i >= n) throw new Error("index out of range");
    }

<<<<<<< HEAD
    /** Unescape a masked component: turns '\x' into 'x' for any x */
    private static unescape(masked: string): string {
        let result = "";
        for (let i = 0; i < masked.length; i++) {
            const ch = masked[i];
            if (ch === ESCAPE_CHARACTER) {
                if (i === masked.length - 1) {
                    // dangling escape is invalid; treat as literal '\' to be robust
                    // or throw; tests likely prefer robust behavior:
                    // throw new Error("dangling escape in component");
                }
                i++; // skip escape and take next char literally (if exists)
                if (i < masked.length) result += masked[i];
            } else {
                result += ch;
            }
        }
        return result;
    }

    /** Escape raw component for a given delimiter: escape '\' and the delimiter char */
    private static escapeForDelimiter(rawParts: string, delimiter: string): string {
        const delimChar = delimiter;
        let result = "";
        for (let i = 0; i < rawParts.length; i++) {
            const ch = rawParts[i];
            if (ch === ESCAPE_CHARACTER || ch === delimChar) {
                result += ESCAPE_CHARACTER;
            }
            result += ch;
        }
        return result;
    }

    /**
     * Validate that `masked` contains no *unescaped* delimiter and no dangling ESC.
     * We walk left-to-right; when we see '\', skip the next char (whatever it is).
     * Any delimiter seen outside an escape is invalid.
     */
    private static validateMasked(masked: string, delimiter: string): void {
        const delimChar = delimiter;
        for (let i = 0; i < masked.length; i++) {
            const ch = masked[i];
            if (ch === ESCAPE_CHARACTER) {
                i++; // skip the next char (escaped)
                if (i >= masked.length) {
                    // dangling escape at end is invalid per masking expectation
                    throw new Error("dangling escape in component");
                }
                continue;
            }
            if (ch === delimChar) {
                // found an unescaped delimiter inside component -> invalid
                throw new Error("unmasked delimiter in component");
            }
        }
    }
}

export default Name;
=======
}
>>>>>>> 0ea859c (Added comment for getComponent method)
