import { listTcReadyTranslationHelpsResources } from "@biblia-studio/door43";
import {
  compareGlToGlTcReadyTranslationHelps,
  findTargetCatalogEntriesClaimingSource,
} from "@biblia-studio/translation";
import type {
  GlToGlCompareSummary,
  SourceFirstClaimRow,
  TranslationHelpsPort,
  TcReadyHelpCatalogRow,
} from "../../ports/translation-helps.port";

function mapCatalogRow(r: {
  identifier: string;
  subject: string;
  title: string;
  version: string;
  catalogOwner?: string;
  catalogRepo?: string;
}): TcReadyHelpCatalogRow {
  return {
    identifier: r.identifier,
    subject: r.subject,
    title: r.title,
    version: r.version,
    catalogOwner: r.catalogOwner,
    catalogRepo: r.catalogRepo,
  };
}

export function createTranslationHelpsAdapter(): TranslationHelpsPort {
  return {
    async listTcReadyCatalog({ language, organization, limit }) {
      const rows = await listTcReadyTranslationHelpsResources({
        language,
        organization,
        limit: limit ?? 500,
      });
      return rows.map(mapCatalogRow);
    },

    async compareTcReadyGlToGl({
      sourceLanguage,
      targetLanguage,
      organization,
      limit,
    }) {
      const result = await compareGlToGlTcReadyTranslationHelps({
        sourceLanguage,
        targetLanguage,
        organization,
        limit,
      });
      const summary: GlToGlCompareSummary = {
        sourceLanguage: result.sourceLanguage,
        targetLanguage: result.targetLanguage,
        matched: result.matched.map((m) => ({
          subject: m.key.subject,
          identifier: m.key.identifier,
          sourceTitle: m.source.title,
          targetTitle: m.target.title,
        })),
        missingInTarget: result.missingInTarget.map((m) => ({
          subject: m.key.subject,
          identifier: m.key.identifier,
          sourceTitle: m.source.title,
        })),
        onlyInTarget: result.onlyInTarget.map((m) => ({
          subject: m.key.subject,
          identifier: m.key.identifier,
          targetTitle: m.target.title,
        })),
      };
      return summary;
    },

    async findTargetsClaimingSource({
      targetLanguage,
      sourceLanguage,
      sourceIdentifier,
      sourceVersion,
      organization,
      limit,
    }) {
      const hits = await findTargetCatalogEntriesClaimingSource({
        targetLanguage,
        sourceLanguage,
        sourceIdentifier,
        sourceVersion,
        organization,
        limit: limit ?? 500,
      });
      return hits.map(
        (h): SourceFirstClaimRow => ({
          identifier: h.summary.identifier,
          subject: h.summary.subject,
          title: h.summary.title,
          version: h.summary.version,
          catalogOwner: h.summary.catalogOwner,
          catalogRepo: h.summary.catalogRepo,
          matchedSources: h.matchedSources.map((s) => ({
            identifier: s.identifier,
            language: s.language,
            version: s.version,
          })),
        }),
      );
    },
  };
}
