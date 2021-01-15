// Credit https://stackabuse.com/handling-file-uploads-in-node-js-with-expres-and-multer/
const imageFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const audioFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(mp3|MP3|wma|WMA)$/)) {
        req.fileValidationError = 'Only audio files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const videoFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(mp4|MP4|MOV|mov|WMV|wmv|FLV|flv)$/)) {
        req.fileValidationError = 'Only video files are allowed!';
        return cb(new Error('Only video files are allowed!'), false);
    }
    cb(null, true);
};

// exports.imageFilter = imageFilter;
// Think if key and value are the same, we can take away : and value. To check
module.exports = { imageFilter: imageFilter, audioFilter: audioFilter, videoFilter: videoFilter };
