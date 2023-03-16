const { stringify } = require("csv-stringify");
const fs = require("fs");
let data = [];
let columns = {
  index: "INDEX",
  name: "DIR_NAME",
};

const writeCSV = (dir_list) => {
  console.log(dir_list);
  dir_list.forEach((e, idx) => {
    data.push([idx, e]);
  });

  stringify(data, { header: true, columns: columns }, (err, output) => {
    if (err) throw err;
    fs.writeFile("vids_folderlist.csv", output, (err) => {
      if (err) throw err;
      console.log("It's saved\n");
    });
  });
};

module.exports = { writeCSV };

// EXAMPLES=====================================================================
//mkdir recursive
// fs.mkdir(path.join(__dirname, "test/data/"), { recursive: true }, (err) => {
//   if (err) {
//     return console.error(err);
//   }
//   console.log("Directory created successfully!");
// });

// fs.writeFile(path.join(__dirname, "/test/data/data.txt"), "data", (err) => {
//   if (err) throw err;
//   console.log("It's saved\n");
// });
// ==============================================================================
