const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const inputFilePath = path.join(__dirname, "dir_list.csv");

const ReadCSV = async () => {
  let res = [];
  fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on("data", function (data) {
      try {
        // console.log("Foldername is: " + data.DIR_NAME);
        res.push(data.DIR_NAME);
      } catch (err) {
        console.log(err);
      }
    })
    .on("end", function () {
      console.log("File read complete!\n");
      console.log(res);
      console.log("No of folders:", res.length);
    });
};

ReadCSV();
