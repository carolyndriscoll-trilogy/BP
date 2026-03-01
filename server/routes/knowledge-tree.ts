import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, BadRequestError, NotFoundError } from '../middleware/error-handler';
import { requireBrainliftAccess, requireBrainliftModify } from '../middleware/brainlift-auth';

export const knowledgeTreeRouter = Router();

// === Categories ===

knowledgeTreeRouter.get(
  '/api/brainlifts/:slug/categories',
  requireAuth,
  requireBrainliftAccess,
  asyncHandler(async (req, res) => {
    const categories = await storage.getCategoriesForBrainlift(req.brainlift!.id);
    res.json(categories);
  })
);

knowledgeTreeRouter.post(
  '/api/brainlifts/:slug/categories',
  requireAuth,
  requireBrainliftModify,
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name?.trim()) {
      throw new BadRequestError('Category name is required');
    }

    // Auto-assign sortOrder as max + 1
    const existing = await storage.getCategoriesForBrainlift(req.brainlift!.id);
    const maxSort = existing.reduce((max, c) => Math.max(max, c.sortOrder), -1);

    const category = await storage.createCategory({
      brainliftId: req.brainlift!.id,
      name: name.trim(),
      sortOrder: maxSort + 1,
    });
    res.status(201).json(category);
  })
);

knowledgeTreeRouter.patch(
  '/api/brainlifts/:slug/categories/:id',
  requireAuth,
  requireBrainliftModify,
  asyncHandler(async (req, res) => {
    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      throw new BadRequestError('Invalid category ID');
    }

    const { name, sortOrder } = req.body;
    const fields: Record<string, unknown> = {};
    if (name !== undefined) fields.name = name;
    if (sortOrder !== undefined) fields.sortOrder = sortOrder;

    const updated = await storage.updateCategoryForBrainlift(categoryId, req.brainlift!.id, fields);
    if (!updated) {
      throw new NotFoundError('Category not found');
    }
    res.json(updated);
  })
);

knowledgeTreeRouter.delete(
  '/api/brainlifts/:slug/categories/:id',
  requireAuth,
  requireBrainliftModify,
  asyncHandler(async (req, res) => {
    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      throw new BadRequestError('Invalid category ID');
    }

    const deleted = await storage.deleteCategoryForBrainlift(categoryId, req.brainlift!.id);
    if (!deleted) {
      throw new NotFoundError('Category not found');
    }
    res.json({ success: true });
  })
);

// === Sources ===

knowledgeTreeRouter.post(
  '/api/brainlifts/:slug/categories/:categoryId/sources',
  requireAuth,
  requireBrainliftModify,
  asyncHandler(async (req, res) => {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) {
      throw new BadRequestError('Invalid category ID');
    }

    const { title, url } = req.body;
    if (!title?.trim()) {
      throw new BadRequestError('Source title is required');
    }

    const source = await storage.createBuilderSource({
      categoryId,
      brainliftId: req.brainlift!.id,
      title: title.trim(),
      url: url?.trim() || null,
    });
    res.status(201).json(source);
  })
);

knowledgeTreeRouter.patch(
  '/api/brainlifts/:slug/sources/:id',
  requireAuth,
  requireBrainliftModify,
  asyncHandler(async (req, res) => {
    const sourceId = parseInt(req.params.id);
    if (isNaN(sourceId)) {
      throw new BadRequestError('Invalid source ID');
    }

    const { title, url, categoryId } = req.body;
    const fields: Record<string, unknown> = {};
    if (title !== undefined) fields.title = title;
    if (url !== undefined) fields.url = url;
    if (categoryId !== undefined) fields.categoryId = categoryId;

    const updated = await storage.updateBuilderSourceForBrainlift(sourceId, req.brainlift!.id, fields);
    if (!updated) {
      throw new NotFoundError('Source not found');
    }
    res.json(updated);
  })
);

knowledgeTreeRouter.delete(
  '/api/brainlifts/:slug/sources/:id',
  requireAuth,
  requireBrainliftModify,
  asyncHandler(async (req, res) => {
    const sourceId = parseInt(req.params.id);
    if (isNaN(sourceId)) {
      throw new BadRequestError('Invalid source ID');
    }

    const deleted = await storage.deleteBuilderSourceForBrainlift(sourceId, req.brainlift!.id);
    if (!deleted) {
      throw new NotFoundError('Source not found');
    }
    res.json({ success: true });
  })
);

// === Facts ===

knowledgeTreeRouter.post(
  '/api/brainlifts/:slug/sources/:sourceId/facts',
  requireAuth,
  requireBrainliftModify,
  asyncHandler(async (req, res) => {
    const sourceId = parseInt(req.params.sourceId);
    if (isNaN(sourceId)) {
      throw new BadRequestError('Invalid source ID');
    }

    const { text } = req.body;
    if (!text?.trim()) {
      throw new BadRequestError('Fact text is required');
    }

    // Auto-assign sequenceId
    const existingFacts = await storage.getFactsForBuilderSource(sourceId);
    const maxSeq = existingFacts.reduce((max, f) => Math.max(max, f.sequenceId), -1);

    const fact = await storage.createBuilderFact({
      sourceId,
      brainliftId: req.brainlift!.id,
      text: text.trim(),
      sequenceId: maxSeq + 1,
    });
    res.status(201).json(fact);
  })
);

knowledgeTreeRouter.patch(
  '/api/brainlifts/:slug/facts/:id',
  requireAuth,
  requireBrainliftModify,
  asyncHandler(async (req, res) => {
    const factId = parseInt(req.params.id);
    if (isNaN(factId)) {
      throw new BadRequestError('Invalid fact ID');
    }

    const { text } = req.body;
    const fields: Record<string, unknown> = {};
    if (text !== undefined) fields.text = text;

    const updated = await storage.updateBuilderFactForBrainlift(factId, req.brainlift!.id, fields);
    if (!updated) {
      throw new NotFoundError('Fact not found');
    }
    res.json(updated);
  })
);

knowledgeTreeRouter.delete(
  '/api/brainlifts/:slug/facts/:id',
  requireAuth,
  requireBrainliftModify,
  asyncHandler(async (req, res) => {
    const factId = parseInt(req.params.id);
    if (isNaN(factId)) {
      throw new BadRequestError('Invalid fact ID');
    }

    const deleted = await storage.deleteBuilderFactForBrainlift(factId, req.brainlift!.id);
    if (!deleted) {
      throw new NotFoundError('Fact not found');
    }
    res.json({ success: true });
  })
);

// === Summaries ===

knowledgeTreeRouter.post(
  '/api/brainlifts/:slug/sources/:sourceId/summaries',
  requireAuth,
  requireBrainliftModify,
  asyncHandler(async (req, res) => {
    const sourceId = parseInt(req.params.sourceId);
    if (isNaN(sourceId)) {
      throw new BadRequestError('Invalid source ID');
    }

    const { text, relatedFactIds } = req.body;
    if (!text?.trim()) {
      throw new BadRequestError('Summary text is required');
    }

    const summary = await storage.createBuilderSummary({
      sourceId,
      brainliftId: req.brainlift!.id,
      text: text.trim(),
      relatedFactIds: relatedFactIds || [],
    });
    res.status(201).json(summary);
  })
);

knowledgeTreeRouter.patch(
  '/api/brainlifts/:slug/summaries/:id',
  requireAuth,
  requireBrainliftModify,
  asyncHandler(async (req, res) => {
    const summaryId = parseInt(req.params.id);
    if (isNaN(summaryId)) {
      throw new BadRequestError('Invalid summary ID');
    }

    const { text, relatedFactIds } = req.body;
    const fields: Record<string, unknown> = {};
    if (text !== undefined) fields.text = text;
    if (relatedFactIds !== undefined) fields.relatedFactIds = relatedFactIds;

    const updated = await storage.updateBuilderSummaryForBrainlift(summaryId, req.brainlift!.id, fields);
    if (!updated) {
      throw new NotFoundError('Summary not found');
    }
    res.json(updated);
  })
);

knowledgeTreeRouter.delete(
  '/api/brainlifts/:slug/summaries/:id',
  requireAuth,
  requireBrainliftModify,
  asyncHandler(async (req, res) => {
    const summaryId = parseInt(req.params.id);
    if (isNaN(summaryId)) {
      throw new BadRequestError('Invalid summary ID');
    }

    const deleted = await storage.deleteBuilderSummaryForBrainlift(summaryId, req.brainlift!.id);
    if (!deleted) {
      throw new NotFoundError('Summary not found');
    }
    res.json({ success: true });
  })
);
