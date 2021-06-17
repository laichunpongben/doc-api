var fs = require('fs');
var express = require('express');
var multer = require('multer');
var { fromPath } = require('pdf2pic'); 
var { createWorker } = require('tesseract.js');
var tesseractWorker = createWorker();

var router = express.Router();
var upload = multer({ dest: './public/docs' })

router.post('/', upload.single('file'), async function(req, res, next) {
  var doc = {};
  var uploadFile = req.file;
  if (uploadFile !== null) {
    console.log(uploadFile);
    var mimeType = uploadFile.mimetype;
    if (mimeType === 'application/pdf') {
      var outPath = "./public/docs/out.json";

      const options = {
        density: 200,
        saveFilename: uploadFile.filename,
        savePath: "./public/images",
        format: "png",
        width: 850,
        height: 1100
      };
      const storeAsImage = fromPath(uploadFile.path, options);
      const pageToConvertAsImage = 1;
      
      storeAsImage(pageToConvertAsImage).then((resolve) => {
        console.log("Page 1 is now converted as image");

        (async () => {
          await tesseractWorker.load();
          await tesseractWorker.loadLanguage('eng');
          await tesseractWorker.initialize('eng');
          var path = "./public/images/" + uploadFile.filename + ".1.png";
          console.log(path);
          const { data: { text } } = await tesseractWorker.recognize(path);
          console.log(text);
          await tesseractWorker.terminate();
        })();
      
        return resolve;
      });

      console.log(doc);
    }
  }
  res.json(doc);
});

module.exports = router;
