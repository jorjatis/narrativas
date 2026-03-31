module.exports = {
  inc: function(value) {
    return parseInt(value, 10) + 1;
  },
  math: function(lvalue, operator, rvalue) {
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
  }
};