const db = require("./db");
console.log(Object.keys(db.models));
const { Link } = db.models;
(async function name(params) {
  await Link.sync({ force: true });
})();
