export function deep(source) {
    var result = {};
    for (var key in source) {
        result[key] = typeof source[key] === 'object' ? deepCoyp(source[key]) : source[key];
    }
    return result;
}