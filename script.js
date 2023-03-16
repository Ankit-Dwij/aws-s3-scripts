require("dotenv").config();
const fs = require("fs");
const AWS = require("aws-sdk");
const path = require("path");
const csv = require("csv-parser");
const prompt = require("prompt-sync")({ sigint: true });

//Read folders list from csv and push it to folder_list array
let folder_list = [];
const ReadCSV = async (inputFilePath, start, end) => {
  fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on("data", function (data) {
      try {
        if (data.INDEX >= start && data.INDEX <= end)
          folder_list.push({ INDEX: data.INDEX, DIR_NAME: data.DIR_NAME });
      } catch (err) {
        console.log(err);
      }
    })
    .on("end", async function () {
      console.log("File read complete!\n");
      console.log(folder_list);
      console.log("No of folders:", folder_list.length);
      await batch_download(folder_list);
    });
};

const batch_download = async (arr) => {
  for (let folder of arr) {
    console.log(
      "\nCURRENTLY DOWNLOADING DIRECTORY :: ",
      folder.DIR_NAME + "   INDEX:" + folder.INDEX + "\n"
    );
    //get all files in the current Folder
    const files = await listFiles(folder.DIR_NAME);
    console.log("=========> No. of files: ", files.length);

    for (let file of files) {
      const filename = file.Key;

      //check and skip if file was already downloaded
      if (fs.existsSync(path.join(__dirname, filename))) {
        console.log("File already downloaded, Skipping...\n");
        continue;
      }

      console.log(
        `=========> Downloading ${files.indexOf(file)} of ${files.length}\n` +
          `=========> FileName : ${filename}`
      );

      //make folder
      fs.mkdirSync(
        path.join(__dirname, path.dirname(filename)),
        { recursive: true },
        (err) => {
          if (err) {
            return console.error(err);
          }
          console.log("Directory created successfully!");
        }
      );
      //start downloading the file
      await downloadFromS3(filename, filename);
    }
  }
  console.log(`\n******* ALL FILES ARE DOWNLOADED *******\n`);
};

const s3 = new AWS.S3();
const config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
};
AWS.config.update(config);

const downloadFromS3 = async (key, location) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
  };

  const { Body } = await s3.getObject(params).promise();
  fs.writeFile(path.join(__dirname, location), Body, (err) => {
    if (err) console.log(err);
    console.log(`Downloaded : ${key}\n\n`);
  });
};

const listFiles = async (foldername) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Prefix: `vids/${foldername}`,
    MaxKeys: 800,
  };

  let data = await s3.listObjects(params).promise();
  // console.log(data);
  return data.Contents;
};

const main = () => {
  const inputFilePath = path.join(__dirname, "vids_folderlist.csv");
  const start = prompt("First index :");
  const end = prompt("Last index :");

  ReadCSV(inputFilePath, Number(start), Number(end));
};

main();
