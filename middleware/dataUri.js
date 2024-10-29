const DataUriParser = require('datauri/parser.js')
const path = require('path')


const dataUri = function(file){
    const datauriparser =new DataUriParser()
    const ext = path.extname(file.originalname)
    return datauriparser.format(ext,file.buffer).content
}

module.exports = dataUri