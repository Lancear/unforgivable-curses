module.exports = function(Interface) {
    Interface.prototype.validatePayload = function() {
        return (req, res, next) => {
            try {
                req.body = this.from(req.body);
                next();
            }
            catch(err) {
                res.status(400).json({ err: err.message });
            }
        }
    };
};