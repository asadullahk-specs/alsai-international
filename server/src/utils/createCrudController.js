const ApiError = require('./ApiError');
const ApiResponse = require('./ApiResponse');
const asyncHandler = require('./asyncHandler');

const createCrudController = (Model, options = {}) => {
  const { sortField = 'displayOrder', searchFields = ['name'], populate } = options;

  return {
    list: asyncHandler(async (req, res) => {
      const { search, page = 1, limit = 100 } = req.query;
      const filter = {};
      if (search) {
        filter.$or = searchFields.map((f) => ({ [f]: new RegExp(search, 'i') }));
      }

      const pageNum = Math.max(Number(page), 1);
      const limitNum = Math.min(Math.max(Number(limit), 1), 200);

      let query = Model.find(filter)
        .sort({ [sortField]: 1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);
      if (populate) query = query.populate(populate);

      const [items, total] = await Promise.all([query, Model.countDocuments(filter)]);

      res.status(200).json(
        new ApiResponse(200, {
          items,
          pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
        })
      );
    }),

    getOne: asyncHandler(async (req, res) => {
      let query = Model.findById(req.params.id);
      if (populate) query = query.populate(populate);
      const item = await query;
      if (!item) throw new ApiError(404, 'Not found');
      res.status(200).json(new ApiResponse(200, { item }));
    }),

    create: asyncHandler(async (req, res) => {
      const item = await Model.create(req.body);
      res.status(201).json(new ApiResponse(201, { item }, 'Created successfully'));
    }),

    update: asyncHandler(async (req, res) => {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) throw new ApiError(404, 'Not found');
      res.status(200).json(new ApiResponse(200, { item }, 'Updated successfully'));
    }),

    remove: asyncHandler(async (req, res) => {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) throw new ApiError(404, 'Not found');
      res.status(200).json(new ApiResponse(200, null, 'Deleted successfully'));
    }),
  };
};

module.exports = createCrudController;
