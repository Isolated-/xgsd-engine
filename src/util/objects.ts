import deepmerge = require('deepmerge')

export const deepmerge2 = (a: any, b: any) => {
    if (!a && !b) return undefined
    if (!a && b) return b
    if (!b && a) return a

    return deepmerge(a, b)
}