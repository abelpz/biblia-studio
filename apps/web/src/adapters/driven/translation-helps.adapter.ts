import {
  buildCatalogMetadataUrl,
  listTcReadyTranslationHelpsResources,
} from "@biblia-studio/door43";
import {
  compareGlToGlTcReadyBookProjects,
  compareGlToGlTcReadyTranslationHelps,
  findTargetCatalogEntriesClaimingSource,
} from "@biblia-studio/translation";
import type {
  GlToGlBookMatrixSummary,
  GlToGlCompareSummary,
  SourceFirstClaimRow,
  TranslationHelpsPort,
  TcReadyHelpCatalogRow,
} from "../../ports/translation-helps.port";

function door43Urls(
  owner: string | undefined,
  repo: string | undefined,
  ref: string | undefined,
): { repoUrl?: string; metadataUrl?: string } {
  if (!owner || !repo || !ref || ref.length === 0) {
    return {};
  }
  return {
    repoUrl: `https://git.door43.org/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    metadataUrl: buildCatalogMetadataUrl({ owner, repo, ref }),
  };
}

function nonEmptyUrl(u: string | undefined): string | undefined {
  return u !== undefined && u.length > 0 ? u : undefined;
}

function mapCatalogRow(r: {
  identifier: string;
  subject: string;
  title: string;
  version: string;
  catalogOwner?: string;
  catalogRepo?: string;
  catalogRef?: string;
  bundleUrl?: string;
}): TcReadyHelpCatalogRow {
  const catalogRef =
    r.catalogRef && r.catalogRef.length > 0 ? r.catalogRef : undefined;
  const refForMeta =
    catalogRef ?? (r.version.length > 0 ? r.version : undefined);
  const links = door43Urls(r.catalogOwner, r.catalogRepo, refForMeta);
  return {
    identifier: r.identifier,
    subject: r.subject,
    title: r.title,
    version: r.version,
    catalogOwner: r.catalogOwner,
    catalogRepo: r.catalogRepo,
    catalogRef,
    door43RepoUrl: links.repoUrl,
    door43MetadataUrl: links.metadataUrl,
    door43BundleUrl: nonEmptyUrl(r.bundleUrl),
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
        matched: result.matched.map((m) => {
          const sRef =
            m.source.catalogRef && m.source.catalogRef.length > 0
              ? m.source.catalogRef
              : m.source.version.length > 0
                ? m.source.version
                : undefined;
          const tRef =
            m.target.catalogRef && m.target.catalogRef.length > 0
              ? m.target.catalogRef
              : m.target.version.length > 0
                ? m.target.version
                : undefined;
          const sLinks = door43Urls(
            m.source.catalogOwner,
            m.source.catalogRepo,
            sRef,
          );
          const tLinks = door43Urls(
            m.target.catalogOwner,
            m.target.catalogRepo,
            tRef,
          );
          return {
            subject: m.key.subject,
            identifier: m.key.identifier,
            sourceTitle: m.source.title,
            targetTitle: m.target.title,
            sourceDoor43RepoUrl: sLinks.repoUrl,
            sourceDoor43MetadataUrl: sLinks.metadataUrl,
            sourceDoor43BundleUrl: nonEmptyUrl(m.source.bundleUrl),
            targetDoor43RepoUrl: tLinks.repoUrl,
            targetDoor43MetadataUrl: tLinks.metadataUrl,
            targetDoor43BundleUrl: nonEmptyUrl(m.target.bundleUrl),
          };
        }),
        missingInTarget: result.missingInTarget.map((m) => {
          const sRef =
            m.source.catalogRef && m.source.catalogRef.length > 0
              ? m.source.catalogRef
              : m.source.version.length > 0
                ? m.source.version
                : undefined;
          const sLinks = door43Urls(
            m.source.catalogOwner,
            m.source.catalogRepo,
            sRef,
          );
          return {
            subject: m.key.subject,
            identifier: m.key.identifier,
            sourceTitle: m.source.title,
            sourceDoor43RepoUrl: sLinks.repoUrl,
            sourceDoor43MetadataUrl: sLinks.metadataUrl,
            sourceDoor43BundleUrl: nonEmptyUrl(m.source.bundleUrl),
          };
        }),
        onlyInTarget: result.onlyInTarget.map((m) => {
          const tRef =
            m.target.catalogRef && m.target.catalogRef.length > 0
              ? m.target.catalogRef
              : m.target.version.length > 0
                ? m.target.version
                : undefined;
          const tLinks = door43Urls(
            m.target.catalogOwner,
            m.target.catalogRepo,
            tRef,
          );
          return {
            subject: m.key.subject,
            identifier: m.key.identifier,
            targetTitle: m.target.title,
            targetDoor43RepoUrl: tLinks.repoUrl,
            targetDoor43MetadataUrl: tLinks.metadataUrl,
          };
        }),
      };
      return summary;
    },

    async compareTcReadyGlToGlBookMatrix({
      sourceLanguage,
      targetLanguage,
      organization,
      limit,
      matrixMatchedLimit,
    }) {
      const result = await compareGlToGlTcReadyBookProjects({
        sourceLanguage,
        targetLanguage,
        organization,
        limit,
        matchedMetadataLimit: matrixMatchedLimit,
      });
      const summary: GlToGlBookMatrixSummary = {
        sourceLanguage: result.sourceLanguage,
        targetLanguage: result.targetLanguage,
        rows: result.matched.map((m) => ({
          subject: m.key.subject,
          identifier: m.key.identifier,
          sourceTitle: m.sourceTitle,
          targetTitle: m.targetTitle,
          bookIdsInBoth: m.bookIdsInBoth,
          bookIdsOnlyInSource: m.bookIdsOnlyInSource,
          bookIdsOnlyInTarget: m.bookIdsOnlyInTarget,
        })),
        skipped: result.skipped.map((s) => ({
          subject: s.key.subject,
          identifier: s.key.identifier,
          reason: s.reason,
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
      return hits.map((h): SourceFirstClaimRow => {
        const catalogRef =
          h.summary.catalogRef && h.summary.catalogRef.length > 0
            ? h.summary.catalogRef
            : h.summary.version.length > 0
              ? h.summary.version
              : undefined;
        const links = door43Urls(
          h.summary.catalogOwner,
          h.summary.catalogRepo,
          catalogRef,
        );
        return {
          identifier: h.summary.identifier,
          subject: h.summary.subject,
          title: h.summary.title,
          version: h.summary.version,
          catalogOwner: h.summary.catalogOwner,
          catalogRepo: h.summary.catalogRepo,
          catalogRef:
            h.summary.catalogRef && h.summary.catalogRef.length > 0
              ? h.summary.catalogRef
              : undefined,
          door43RepoUrl: links.repoUrl,
          door43MetadataUrl: links.metadataUrl,
          door43BundleUrl: nonEmptyUrl(h.summary.bundleUrl),
          matchedSources: h.matchedSources.map((s) => ({
            identifier: s.identifier,
            language: s.language,
            version: s.version,
          })),
        };
      });
    },
  };
}
