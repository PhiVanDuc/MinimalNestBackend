const response = (res, status, data) => {
    return res.status(status).json(data);
}

module.exports = response;