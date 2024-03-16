var express = require('express');
var router = express.Router();
var _ = require('lodash');
var logger = require('../lib/logger');
var log = logger();
var multer = require('multer');
var items = require('../init_data.json').data;
var curId = _.size(items);
var path = require('path')
/* GET items listing. */
router.get('/', function(req, res) {
    res.json(_.toArray(items));
});

/* Create a new item */
router.post('/', function(req, res) {
    var item = req.body;
    curId += 1;
    item.id = curId;
    items[item.id] = item;
    log.info('Created item', item);
    res.json(item);
});

/* Get a specific item by id */
router.get('/:id', function(req, res, next) {
    var item = items[req.params.id];
    if (!item) {
        return next();
    }
    res.json(items[req.params.id]);
});

/* Delete a item by id */
router.delete('/:id', function(req, res) {
    var item = items[req.params.id];
    delete items[req.params.id];
    res.status(204);
    log.info('Deleted item', item);
    res.json(item);
});

/* Update a item by id */
router.put('/:id', function(req, res, next) {
    var item = req.body;
    if (item.id != req.params.id) {
        return next(new Error('ID paramter does not match body'));
    }
    items[item.id] = item;
    log.info('Updating item', item);
    res.json(item);
});

const uploadPic = async (req, res) => {
	try {
		// Check if a file was uploaded
		if (!req.file) {
			return res
				.status(400)
				.json({ success: false, message: 'No image uploaded' });
		}

		// Get the file name
		const imgName = path.basename(req.file.path);

		res.status(200).json({ success: true, imagePath: imgName });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

// Define storage for uploaded files
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'upload/images'); // Directory where uploaded files will be stored
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname); // Filename to save with timestamp
	},
});

// Initialize multer upload middleware
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB in bytes
	},
});

router.post('/uploadpic', upload.single('image'), async (req, res) => {
	try {
		// Check if a file was uploaded
		if (!req.file) {
			return res
				.status(400)
				.json({ success: false, message: 'No image uploaded' });
		}

		// Get the file name
		const imgName = path.basename(req.file.path);

		res.status(200).json({ success: true, imagePath: imgName });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

module.exports = router;
