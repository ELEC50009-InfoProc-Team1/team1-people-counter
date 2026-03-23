export type Enum<T> = T[keyof T];
export type EnumValue<T, K extends keyof T> = T[K];
