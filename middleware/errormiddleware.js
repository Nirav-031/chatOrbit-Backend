const errorMiddleware = (err, req, res, next) => {
    const msg = err.message || "internal server error";
    const status = err.status || 400;
    return res.status(status).json(msg);
}

module.exports=errorMiddleware