const Product = require('./../models/productModel');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

exports.setProductUserId = (req, res, next) => {
  console.log(req.user.id);
  req.body.refOfUser = req.user.id;
  next();
};

//Add product to DB
exports.allproduct = factory.getAll(Product);
exports.singleproduct = factory.getOne(Product, 'reviews');
exports.createProduct = factory.createOne(Product);
exports.deleteProduct = factory.deleteOne(Product);
exports.updateProduct = factory.updateOne(Product);

exports.shopOwnerProducts = async (req, res, next) => {
  try {
    const ShopOwnerProducts = await Product.find({ refOfUser: req.params.id });
    console.log(ShopOwnerProducts);
    res.status(200).json({
      status: 'success',
      result: ShopOwnerProducts.length,
      data: ShopOwnerProducts,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// '/product-within/:distance/center/:latlng/unit/:unit',
///product-within/233/center/31.520370,74.358749/unit/m

//hum disk ki jaga memory ma image store karna chata ha is liya uper diskStorage wala ko comment kar diya
const multerStorage = multer.memoryStorage();

//multer filter
//is sa hum pata kara ga k uploaded cheez image ha k nhi
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb('Not an image! please upload image', false);
  }
};

//to upload photo in dest folder
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// upload.single('image'); to Upload 1 image
// upload.array('images',5); to upload multiple image with same name

exports.resizeProductImages = async (req, res, next) => {
  try {
    if (!req.files.imageCover || !req.files.images) return next();

    //1) Cover image
    //ab hum product update karna k liya factory function use kar raha ha is liya
    //factory function ma body ma jo req ati ha vo usa update kar data ha
    //is liya huma req.body ma cheeza add karni pari ta k vo update ho jay
    req.body.imageCover = `product-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 }) //hum na jab image ko resize kar diya to ab hum usa disk ma store kar dain ga
      .toFile(`public/images/products/${req.body.imageCover}`);

    //Other images
    req.body.images = [];
    //ab humara pass array of image ha is liya hum na map lagaya or map k anadar await ha jo sirf ik bar chla ga next map pa vo nahi chla ga
    //is solve karna k liya hum na await promise.all kar diya
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `product-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 }) //hum na jab image ko resize kar diya to ab hum usa disk ma store kar dain ga
          .toFile(`public/images/products/${filename}`);

        req.body.images.push(filename);
      })
    );

    next();
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTourWithin = async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return res.status(404).json({
      status: 'fail',
      message: 'please provide longitude and latitude',
    });
  }

  const product = await Product.find({
    location: { $geoWithin: { $centerSphere: [[lat, lng], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: product.length,
    data: {
      data: product,
    },
  });
};
