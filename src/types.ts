export type PropsOf<T> = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    [P in keyof T as T[P] extends Function ? never : P]: T[P]
};

// Same as Partial<PropsOf<T>>;

export type Proto<T> = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    [P in keyof T as T[P] extends Function ? never : P]?: T[P]
};
