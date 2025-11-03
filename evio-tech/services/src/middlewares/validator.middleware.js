function validate(schema) {
    return (req, res, next) => {
      // integrate with Joi or express-validator later
      next();
    };
  }
  
  module.exports = { validate };
  