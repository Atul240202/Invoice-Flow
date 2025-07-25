const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        //console.log("Validation Errors:", errors.array());
        return res.status(422).json({
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        })
    }
    next();
}

module.exports = validateRequest;