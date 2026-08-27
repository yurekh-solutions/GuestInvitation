import Template from '../models/Template.js';

// @desc    Get all templates with filters
// @route   GET /api/templates
export const getTemplates = async (req, res) => {
  try {
    const { category, language, isPremium, hasVideo, search, limit = 50, page = 1 } = req.query;

    const filter = { isActive: true };
    if (category && category !== 'all') filter.category = category;
    if (language) filter.language = language;
    if (isPremium !== undefined) filter.isPremium = isPremium === 'true';
    if (hasVideo !== undefined) filter.hasVideo = hasVideo === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const templates = await Template.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('name slug category subcategory previewImage isPremium price hasVideo tags language');

    const total = await Template.countDocuments(filter);

    res.json({
      success: true,
      templates,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single template
// @route   GET /api/templates/:id
export const getTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
      isActive: true,
    });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create template (admin)
// @route   POST /api/templates
export const createTemplate = async (req, res) => {
  try {
    const template = await Template.create(req.body);
    res.status(201).json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update template (admin)
// @route   PUT /api/templates/:id
export const updateTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete template (admin)
// @route   DELETE /api/templates/:id
export const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get categories with counts
// @route   GET /api/templates/categories/stats
export const getCategoryStats = async (req, res) => {
  try {
    const stats = await Template.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryMap = {};
    stats.forEach((s) => {
      categoryMap[s._id] = s.count;
    });

    res.json({ success: true, stats: categoryMap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
