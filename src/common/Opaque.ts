// Base opaque type interface
interface OpaqueType<OpaqueT> {
  readonly _type: OpaqueT;
}

// Generic opaque type
export type Opaque<T, OpaqueT> = T & OpaqueType<OpaqueT>;
