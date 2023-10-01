var express = require('express');
var router = express.Router({ mergeParams: true });

const loginController = require('../controller/loginController');
const productController = require('../controller/productController');
const reviewRouter = require('./review');

//asa hi hum na app.js ma bhi use kiya tha in sab route ko call karn k liya see 57 line
router.use('/:productid/review', reviewRouter); // Jab bhi ya '/:productid/review' route aya ga to hum review route ko use kara ga

router
  .route('/addProduct')
  .post(
    loginController.protect,
    loginController.restrictTo('shopOwner'),
    productController.setProductUserId,
    productController.createProduct
  );

router.route('/singleproduct/:id').get(productController.singleproduct);

router
  .route('/allProduct')
  .get(
    loginController.protect,
    loginController.restrictTo('admin'),
    productController.allproduct
  );

router
  .route('/shopOwnerProducts/:id')
  .get(
    loginController.protect,
    loginController.restrictTo('shopOwner', 'admin'),
    productController.shopOwnerProducts
  );

router
  .route('/deleteProduct/:id')
  .delete(
    loginController.protect,
    loginController.restrictTo('shopOwner', 'admin'),
    productController.deleteProduct
  );

router
  .route('/updateProduct/:id')
  .patch(
    loginController.protect,
    loginController.restrictTo('shopOwner'),
    productController.uploadProductImages,
    productController.resizeProductImages,
    productController.updateProduct
  );

router
  .route('/product-within/:distance/center/:latlng/unit/:unit')
  .get(productController.getTourWithin);

module.exports = router;
