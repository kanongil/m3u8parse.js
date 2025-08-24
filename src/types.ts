export type PropsOf<T> = {
    [P in keyof T as T[P] extends Function ? never : P]: T[P]
};

// Same as Partial<PropsOf<T>>;

export type Proto<T> = {
    [P in keyof T as T[P] extends Function ? never : P]?: T[P]
};
