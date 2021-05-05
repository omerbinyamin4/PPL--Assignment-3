import R, { add, map, zipWith } from "ramda";
import { makeEmptySExp, Value } from './L21-value-store';
import { Result, makeFailure, makeOk, bind, either } from "../shared/result";

// ========================================================
// Box datatype
// Encapsulate mutation in a single type.
type Box<T> = T[];
const makeBox = <T>(x: T): Box<T> => ([x]);
const unbox = <T>(b: Box<T>): T => b[0];
const setBox = <T>(b: Box<T>, v: T): void => { b[0] = v; return; }

// ========================================================
// Store datatype
export interface Store {
    tag: "Store";
    vals: Box<Box<Value>[]>;
}

export const isStore = (x: any): x is Store => x.tag === "Store";

export const makeEmptyStore = (): Store => ({tag : "Store", vals : makeBox([])});

export const theStore: Store = makeEmptyStore();

export const extendStore = (s: Store, val: Value): Store => {
    setBox(s.vals, R.insert(R.length(unbox(s.vals)), makeBox(val), unbox(s.vals)));
    return s;
}

export const applyStore = (store: Store, address: number): Result<Value> =>
    address > R.length(unbox(store.vals)) ? makeFailure("Illegal address") : 
                                        makeOk(unbox(unbox(store.vals)[address]));

export const setStore = (store: Store, address: number, val: Value): void => {
    if (address <= R.length(unbox(store.vals)))
        setBox(unbox(store.vals)[address], val);
}

// ========================================================
// Environment data type
// export type Env = EmptyEnv | ExtEnv;
export type Env = GlobalEnv | ExtEnv;

interface GlobalEnv {
    tag: "GlobalEnv";
    vars: Box<string[]>;
    addresses: Box<number[]>;
}

export interface ExtEnv {
    tag: "ExtEnv";
    vars: string[];
    addresses: number[];
    nextEnv: Env;
}

export const makeGlobalEnv = (): GlobalEnv =>
    ({tag: "GlobalEnv", vars: makeBox([]), addresses:makeBox([])});

export const isGlobalEnv = (x: any): x is GlobalEnv => x.tag === "GlobalEnv";

// There is a single mutable value in the type Global-env
export const theGlobalEnv = makeGlobalEnv();


export const makeExtEnv = (vs: string[], addresses: number[], env: Env): ExtEnv =>
    ({tag: "ExtEnv", vars: vs, addresses: addresses, nextEnv: env})


const isExtEnv = (x: any): x is ExtEnv => x.tag === "ExtEnv";

export const isEnv = (x: any): x is Env => isGlobalEnv(x) || isExtEnv(x);

// Apply-env
export const applyEnv = (env: Env, v: string): Result<number> =>
    isGlobalEnv(env) ? applyGlobalEnv(env, v) :
    applyExtEnv(env, v);

const applyGlobalEnv = (env: GlobalEnv, v: string): Result<number> => 
    unbox(env.vars).includes(v) ? makeOk(unbox(env.addresses)[unbox(env.vars).indexOf(v)]) : makeFailure("var is not");
    

export const globalEnvAddBinding = (v: string, addr: number): void =>{
    setBox(theGlobalEnv.vars, R.insert(R.length(unbox(theGlobalEnv.vars)), v , unbox(theGlobalEnv.vars)));
    setBox(theGlobalEnv.addresses, R.insert(R.length(unbox(theGlobalEnv.addresses)), addr , unbox(theGlobalEnv.addresses)));
}
     
    

const applyExtEnv = (env: ExtEnv, v: string): Result<number> =>
    env.vars.includes(v) ? makeOk(env.addresses[env.vars.indexOf(v)]) : applyEnv(env.nextEnv, v);

// export const applyEnvStore = (env: Env): Store => 
//     isGlobalEnv(env) ? env.store : applyEnvStore(env.nextEnv);
