const R = require('ramda');

// Funciones de utilidad para programación funcional

// Composición de funciones
const compose = (...fns) => R.compose(...fns);

// Pipe (composición de izquierda a derecha)
const pipe = (...fns) => R.pipe(...fns);

// Currying
const curry = R.curry;

// Map
const map = R.map;

// Filter
const filter = R.filter;

// Reduce
const reduce = R.reduce;

// Find
const find = R.find;

// Some (al menos uno cumple la condición)
const some = R.some;

// Every (todos cumplen la condición)
const every = R.every;

// Group by
const groupBy = R.groupBy;

// Sort by
const sortBy = R.sortBy;

// Order by
const orderBy = R.orderBy;

// Take (primeros n elementos)
const take = R.take;

// Drop (eliminar primeros n elementos)
const drop = R.drop;

// Head (primer elemento)
const head = R.head;

// Tail (todos menos el primer elemento)
const tail = R.tail;

// Last (último elemento)
const last = R.last;

// Initial (todos menos el último elemento)
const initial = R.initial;

// Length
const length = R.length;

// Reverse
const reverse = R.reverse;

// Flatten
const flatten = R.flatten;

// Flat map
const flatMap = R.chain;

// Unique
const uniq = R.uniq;

// Unique by
const uniqBy = R.uniqBy;

// Pluck (extraer propiedad de objetos en array)
const pluck = R.pluck;

// Prop (obtener propiedad de objeto)
const prop = R.prop;

// Props (obtener múltiples propiedades de objeto)
const props = R.props;

// Path (obtener valor de ruta anidada)
const path = R.path;

// Path or (obtener valor de ruta anidada o valor por defecto)
const pathOr = R.pathOr;

// Merge (fusionar objetos)
const merge = R.merge;

// Merge deep (fusión profunda de objetos)
const mergeDeep = R.mergeDeep;

// Pick (seleccionar propiedades de objeto)
const pick = R.pick;

// Omit (eliminar propiedades de objeto)
const omit = R.omit;

// Keys (obtener claves de objeto)
const keys = R.keys;

// Values (obtener valores de objeto)
const values = R.values;

// To pairs (convertir objeto a array de pares)
const toPairs = R.toPairs;

// From pairs (convertir array de pares a objeto)
const fromPairs = R.fromPairs;

// Zip (combinar dos arrays)
const zip = R.zip;

// Zip object (crear objeto desde dos arrays)
const zipObj = R.zipObj;

// Range (crear array de números en rango)
const range = R.range;

// Repeat (repetir valor n veces)
const repeat = R.repeat;

// Times (ejecutar función n veces)
const times = R.times;

// Memoize (memorizar resultados de función)
const memoize = R.memoize;

// Once (ejecutar función solo una vez)
const once = R.once;

// Debounce (ejecutar función después de esperar)
const debounce = R.debounce;

// Throttle (limitar ejecución de función)
const throttle = R.throttle;

// Tap (ejecutar función y retornar valor original)
const tap = R.tap;

// Identity (retornar el valor recibido)
const identity = R.identity;

// Always (retornar siempre el mismo valor)
const always = R.always;

// T (retornar true)
const T = R.T;

// F (retornar false)
const F = R.F;

// Is (verificar tipo)
const is = R.is;

// Is nil (verificar si es null o undefined)
const isNil = R.isNil;

// Has (verificar si objeto tiene propiedad)
const has = R.has;

// Type (obtener tipo de valor)
const type = R.type;

// Clone (clonar valor)
const clone = R.clone;

// Deep clone (clonación profunda)
const cloneDeep = R.cloneDeep;

// Equals (comparar igualdad profunda)
const equals = R.equals;

// Add (sumar)
const add = R.add;

// Subtract (restar)
const subtract = R.subtract;

// Multiply (multiplicar)
const multiply = R.multiply;

// Divide (dividir)
const divide = R.divide;

// Inc (incrementar en 1)
const inc = R.inc;

// Dec (decrementar en 1)
const dec = R.dec;

// Sum (sumar array de números)
const sum = R.sum;

// Product (multiplicar array de números)
const product = R.product;

// Mean (promedio)
const mean = R.mean;

// Median (mediana)
const median = R.median;

// Min (mínimo)
const min = R.min;

// Max (máximo)
const max = R.max;

// Math utilities
const mathUtils = {
  add, subtract, multiply, divide, inc, dec,
  sum, product, mean, median, min, max
};

// Array utilities
const arrayUtils = {
  map, filter, reduce, find, some, every, groupBy,
  sortBy, orderBy, take, drop, head, tail, last,
  initial, length, reverse, flatten, flatMap, uniq,
  uniqBy, pluck, range, repeat, times, zip, zipObj
};

// Object utilities
const objectUtils = {
  prop, props, path, pathOr, merge, mergeDeep, pick,
  omit, keys, values, toPairs, fromPairs, has, isNil,
  type, clone, cloneDeep, equals
};

// Function utilities
const functionUtils = {
  compose, pipe, curry, memoize, once, debounce,
  throttle, tap, identity, always, T, F
};

// Logic utilities
const logicUtils = {
  is, some, every, has
};

module.exports = {
  // Exportar todas las funciones individualmente
  ...mathUtils,
  ...arrayUtils,
  ...objectUtils,
  ...functionUtils,
  ...logicUtils,
  
  // Exportar grupos de utilidades
  mathUtils,
  arrayUtils,
  objectUtils,
  functionUtils,
  logicUtils
};