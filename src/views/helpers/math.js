// Realiza operaciones matemáticas básicas
// Uso:
// {{math 5 "+" 3}}        → 8
// {{math @index "+" 1}}   → incrementa el índice sin usar inc
// {{math 10 "/" 2}}       → 5
// {{math precio "*" 1.21}} → aplicar IVA

module.exports = function(lvalue, operator, rvalue) {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);

  const operators = {
    "+": lvalue + rvalue,
    "-": lvalue - rvalue,
    "*": lvalue * rvalue,
    "/": lvalue / rvalue,
    "%": lvalue % rvalue
  };

  return operators[operator] ?? 0;
};