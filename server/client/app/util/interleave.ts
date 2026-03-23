export function interleave<T>(arr: T[], insert: T): T[] {
    return arr.flatMap(e => [e, insert]).slice(0, -1);
}
