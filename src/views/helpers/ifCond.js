// Permite hacer comparaciones más complejas que {{#if}}
// Uso:
// {{#ifCond edad ">" 18}} Mayor de edad {{/ifCond}}
// {{#ifCond rol "===" "admin"}} Mostrar panel {{/ifCond}}
// {{#ifCond @index ">" 1}} <span>Doctor destacado</span> {{/ifCond}}

module.exports = function(v1, operator, v2, options) {
  switch (operator) {
    case "==": return v1 == v2 ? options.fn(this) : options.inverse(this);
    case "===": return v1 === v2 ? options.fn(this) : options.inverse(this);
    case "!=": return v1 != v2 ? options.fn(this) : options.inverse(this);
    case "!==": return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case "<": return v1 < v2 ? options.fn(this) : options.inverse(this);
    case "<=": return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case ">": return v1 > v2 ? options.fn(this) : options.inverse(this);
    case ">=": return v1 >= v2 ? options.fn(this) : options.inverse(this);
    default: return options.inverse(this);
  }
};