var _ = require("lodash");
var defaults = require("./default.js");
export const config = require("./" + (process.env.NODE_ENV || "development") + ".js");
export default { config }
