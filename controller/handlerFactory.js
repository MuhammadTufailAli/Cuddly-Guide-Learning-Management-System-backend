// it is used to handle query
const APIFeatures = require('./../utils/apiFeatures');

//ya ik asa global function ho ga jo sara delete ko handle kar la ga
exports.deleteOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({
        status: 'fail',
        message: 'No document found with that ID',
      });
    }
    res.status(201).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

//Ab kahi bhi update karna ho hum isa use kar sakta ha
exports.updateOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return res.status(404).json({
        status: 'fail',
        message: 'No document found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'No document found with that ID',
    });
  }
};

exports.createOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',

      data: {
        doc,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getOne = (Model, popOptions) => async (req, res, next) => {
  try {
    if (popOptions) {
      var doc = await Model.findById(req.params.id).populate(popOptions);
    } else {
      var doc = await Model.findById(req.params.id);
    }

    if (!doc) {
      return res.status(404).json({
        status: 'fail',
        message: 'No document found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAll = (Model) => async (req, res, next) => {
  console.log(req.params);
  try {
    //To allow for nested GET reviews on tour
    let filter = {};
    //mtlb agr review route k phly sa ik product aa raha ho or hum sirf us product k reviews show is tarha karva sakta ha
    if (req.params.productid) filter = { refOfProduct: req.params.productid }; // yaha filter object ban raha jis ma hum na refOfProduct key ki or id value k tor pa di

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;
    if (!doc) {
      return res.status(404).json({
        status: 'fail',
        message: 'No document found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      result: doc.length,
      user: req.user,
      data: {
        doc,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
