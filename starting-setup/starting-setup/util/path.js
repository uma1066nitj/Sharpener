const path = require("path");

// module.exports = path.dirname(process.mainModule.filename);
module.exports = require.main ? path.dirname(require.main.filename) : null;
