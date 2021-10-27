const fs = require("fs");
const path = require("path");
const { logger } = require("../src/utils/logger");

const directory = "src/samples/blueprints";

if (!fs.existsSync("export")) {
  fs.mkdirSync("export");
}
if (!fs.existsSync("export/blueprints")) {
  fs.mkdirSync("export/blueprints");
} else {
  fs.readdirSync("export/blueprints", (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlinkSync(path.join("export/blueprints", file), (err) => {
        if (err) throw err;
      });
    }
  });
}

logger.debug("starting export");

fs.readdir(directory, async (err, files) => {
  if (err) {
    logger.error("Unable to find blueprints directory");
    process.exit(1);
  }

  const summary = [];
  files.forEach(async (file) => {
    if (path.extname(`../${directory}/${file}`) === ".js") {
      const scriptName = path.basename(`../${directory}/${file}`, ".js");
      const spec = require(`../${directory}/${scriptName}`);
      fs.writeFileSync(
        `export/blueprints/${spec.name}.json`,
        JSON.stringify(spec, null, 2)
      );

      logger.info(`Exporting ${file} to ${spec.name}.json!`);

      return {
        name: spec.name,
        created_at: new Date(),
        version: 0,
      };
    }
    if (
      path.extname(`../${directory}/${file}`) === ".json" &&
      file !== "summary.json"
    ) {
      let bp;
      const data = fs.readFileSync(`src/blueprints/${file}`);
      bp = JSON.parse(data);

      fs.writeFileSync(
        `export/blueprints/${bp.name}.json`,
        JSON.stringify(bp, null, 2)
      );

      logger.info(`Exporting ${file} to ${bp.name}.json!`);

      return {
        name: bp.name,
        created_at: new Date(),
        version: 0,
      };
    }
  });
});
