import {
  db, eq, and,
  builderCategories, builderSources, builderFacts, builderSummaries,
  type BuilderCategory, type InsertBuilderCategory,
  type BuilderSource, type InsertBuilderSource,
  type BuilderFact, type InsertBuilderFact,
  type BuilderSummary, type InsertBuilderSummary,
} from './base';

// === Categories ===

export async function createCategory(data: InsertBuilderCategory): Promise<BuilderCategory> {
  const [category] = await db.insert(builderCategories).values(data as any).returning();
  return category;
}

export async function updateCategoryForBrainlift(
  categoryId: number,
  brainliftId: number,
  fields: Partial<Pick<BuilderCategory, 'name' | 'sortOrder'>>
): Promise<BuilderCategory | null> {
  const [updated] = await db.update(builderCategories)
    .set(fields as any)
    .where(and(eq(builderCategories.id, categoryId), eq(builderCategories.brainliftId, brainliftId)))
    .returning();
  return updated || null;
}

export async function deleteCategoryForBrainlift(
  categoryId: number,
  brainliftId: number
): Promise<boolean> {
  const result = await db.delete(builderCategories)
    .where(and(eq(builderCategories.id, categoryId), eq(builderCategories.brainliftId, brainliftId)));
  return (result.rowCount ?? 0) > 0;
}

export async function getCategoriesForBrainlift(brainliftId: number): Promise<BuilderCategory[]> {
  return await db.select().from(builderCategories)
    .where(eq(builderCategories.brainliftId, brainliftId))
    .orderBy(builderCategories.sortOrder);
}

// === Sources ===

export async function createBuilderSource(data: InsertBuilderSource): Promise<BuilderSource> {
  const [source] = await db.insert(builderSources).values(data as any).returning();
  return source;
}

export async function updateBuilderSourceForBrainlift(
  sourceId: number,
  brainliftId: number,
  fields: Partial<Pick<BuilderSource, 'title' | 'url' | 'categoryId' | 'sortOrder'>>
): Promise<BuilderSource | null> {
  const [updated] = await db.update(builderSources)
    .set(fields as any)
    .where(and(eq(builderSources.id, sourceId), eq(builderSources.brainliftId, brainliftId)))
    .returning();
  return updated || null;
}

export async function deleteBuilderSourceForBrainlift(
  sourceId: number,
  brainliftId: number
): Promise<boolean> {
  const result = await db.delete(builderSources)
    .where(and(eq(builderSources.id, sourceId), eq(builderSources.brainliftId, brainliftId)));
  return (result.rowCount ?? 0) > 0;
}

// === Facts ===

export async function createBuilderFact(data: InsertBuilderFact): Promise<BuilderFact> {
  const [fact] = await db.insert(builderFacts).values(data as any).returning();
  return fact;
}

export async function updateBuilderFactForBrainlift(
  factId: number,
  brainliftId: number,
  fields: Partial<Pick<BuilderFact, 'text' | 'sequenceId'>>
): Promise<BuilderFact | null> {
  const [updated] = await db.update(builderFacts)
    .set(fields as any)
    .where(and(eq(builderFacts.id, factId), eq(builderFacts.brainliftId, brainliftId)))
    .returning();
  return updated || null;
}

export async function deleteBuilderFactForBrainlift(
  factId: number,
  brainliftId: number
): Promise<boolean> {
  const result = await db.delete(builderFacts)
    .where(and(eq(builderFacts.id, factId), eq(builderFacts.brainliftId, brainliftId)));
  return (result.rowCount ?? 0) > 0;
}

export async function getFactsForBuilderSource(sourceId: number): Promise<BuilderFact[]> {
  return await db.select().from(builderFacts)
    .where(eq(builderFacts.sourceId, sourceId))
    .orderBy(builderFacts.sequenceId);
}

// === Summaries ===

export async function createBuilderSummary(data: InsertBuilderSummary): Promise<BuilderSummary> {
  const [summary] = await db.insert(builderSummaries).values(data as any).returning();
  return summary;
}

export async function updateBuilderSummaryForBrainlift(
  summaryId: number,
  brainliftId: number,
  fields: Partial<Pick<BuilderSummary, 'text' | 'relatedFactIds'>>
): Promise<BuilderSummary | null> {
  const updateFields: Record<string, unknown> = { ...fields };
  updateFields.updatedAt = new Date();
  const [updated] = await db.update(builderSummaries)
    .set(updateFields as any)
    .where(and(eq(builderSummaries.id, summaryId), eq(builderSummaries.brainliftId, brainliftId)))
    .returning();
  return updated || null;
}

export async function deleteBuilderSummaryForBrainlift(
  summaryId: number,
  brainliftId: number
): Promise<boolean> {
  const result = await db.delete(builderSummaries)
    .where(and(eq(builderSummaries.id, summaryId), eq(builderSummaries.brainliftId, brainliftId)));
  return (result.rowCount ?? 0) > 0;
}

// === Full Tree Fetch (no N+1) ===

export async function getKnowledgeTree(brainliftId: number) {
  const categories = await db.select().from(builderCategories)
    .where(eq(builderCategories.brainliftId, brainliftId))
    .orderBy(builderCategories.sortOrder);

  if (categories.length === 0) return undefined;

  const sources = await db.select().from(builderSources)
    .where(eq(builderSources.brainliftId, brainliftId))
    .orderBy(builderSources.sortOrder);

  const allFacts = await db.select().from(builderFacts)
    .where(eq(builderFacts.brainliftId, brainliftId))
    .orderBy(builderFacts.sequenceId);

  const allSummaries = await db.select().from(builderSummaries)
    .where(eq(builderSummaries.brainliftId, brainliftId));

  // Group facts and summaries by sourceId
  const factsBySource = new Map<number, BuilderFact[]>();
  for (const fact of allFacts) {
    const arr = factsBySource.get(fact.sourceId) || [];
    arr.push(fact);
    factsBySource.set(fact.sourceId, arr);
  }

  const summariesBySource = new Map<number, BuilderSummary[]>();
  for (const summary of allSummaries) {
    const arr = summariesBySource.get(summary.sourceId) || [];
    arr.push(summary);
    summariesBySource.set(summary.sourceId, arr);
  }

  // Group sources by categoryId
  const sourcesByCategory = new Map<number, Array<BuilderSource & { facts: BuilderFact[]; summaries: BuilderSummary[] }>>();
  for (const source of sources) {
    const enrichedSource = {
      ...source,
      facts: factsBySource.get(source.id) || [],
      summaries: summariesBySource.get(source.id) || [],
    };
    const arr = sourcesByCategory.get(source.categoryId) || [];
    arr.push(enrichedSource);
    sourcesByCategory.set(source.categoryId, arr);
  }

  return {
    categories: categories.map(cat => ({
      ...cat,
      sources: sourcesByCategory.get(cat.id) || [],
    })),
  };
}
