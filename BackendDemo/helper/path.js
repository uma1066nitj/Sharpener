const path = require("path");

// module.exports = path.dirname(process.main.filename);
module.exports = require.main ? path.dirname(require.main.filename) : null;
