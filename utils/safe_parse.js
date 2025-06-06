const safeParse = (str) => {
    try { return JSON.parse(str) }
    catch { return null }
};

module.exports = safeParse;