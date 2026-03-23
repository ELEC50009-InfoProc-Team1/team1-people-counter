export type Nullable<T> = T | null | undefined;

export type ConditionalKeys<T, U> = {
    [K in keyof T]: NonNullable<T[K]> extends U ? K : never;
}[keyof T];
