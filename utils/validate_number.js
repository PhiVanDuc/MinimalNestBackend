const validateNumber = (value, min = 0) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min;
};

module.exports = validateNumber;