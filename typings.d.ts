declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.json';
declare module '*.glsl' {
  const glsl: string;
  export default glsl;
}
declare module 'web-worker:*' {
  const WokerFactory: new () => Worker;
  export default WokerFactory;
}

type WithNull<T> = T | null;
type WithUndef<T> = T | undefined;
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type Requireal<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
