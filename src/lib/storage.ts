const P = 'olcw:'
export const store = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem(P + k)
      return v == null ? d : (JSON.parse(v) as T)
    } catch {
      return d
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(P + k, JSON.stringify(v))
    } catch {
      /* private mode: ignore */
    }
  },
}
