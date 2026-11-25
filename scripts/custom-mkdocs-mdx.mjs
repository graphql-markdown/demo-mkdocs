import { basename, dirname, relative, resolve, sep } from "node:path";

import {
  fileExists,
  MARKDOWN_EOL,
  readFile,
  saveFile,
} from "@graphql-markdown/utils";

import MkDocsFormatter from "@graphql-markdown/formatters/mkdocs";
import { toLink } from "@graphql-markdown/printer-legacy";

const mkdocsFormatFunctions =
  typeof MkDocsFormatter.createMDXFormatter === "function"
    ? MkDocsFormatter.createMDXFormatter()
    : MkDocsFormatter;

const INDEX_MD = "index.md";
export const mdxExtension = ".md";
const indexWriteQueue = new Map();

// Pages render concurrently, so this may hold another page's options: only read
// settings shared by every page (schema, basePath, hierarchy, groups, deprecated, formatMDXLink).
let printOptions;

/**
 * Hook that captures the resolved print options before each page is printed.
 */
const beforePrintTypeHook = (event) => {
  printOptions = event.data.options;
};

/**
 * Replaces inline code names matching a schema type with a link to its page.
 */
const linkEntities = (text) => {
  const schema = printOptions?.schema;
  const rootTypes = [
    schema?.getQueryType(),
    schema?.getMutationType(),
    schema?.getSubscriptionType(),
  ];

  return text.replaceAll(/`([_A-Za-z][_0-9A-Za-z]*)`/g, (match, name) => {
    const type = schema?.getType(name);
    if (!type || name.startsWith("__") || rootTypes.includes(type)) {
      return match;
    }
    const { url } = toLink(type, name, undefined, printOptions);
    return url === "#" ? match : `[\`${name}\`](${url})`;
  });
};

/**
 * Formatter override that links entities in deprecation admonitions, whatever
 * the title case, so the `@deprecatedType` notices (titled "Deprecated") are
 * linked too.
 */
const formatMDXAdmonition = (admonition, meta) => {
  const text =
    admonition.title?.toLowerCase() === "deprecated" && admonition.text
      ? linkEntities(admonition.text)
      : admonition.text;
  return mkdocsFormatFunctions.formatMDXAdmonition(
    { ...admonition, text },
    meta,
  );
};

// Public URL of the generated pages' folder: `site_url` in mkdocs.yml + "graphql"
const COPIES_URL = "https://graphql-markdown.dev/demo-mkdocs/graphql";

/**
 * Appends a "View as Markdown" link to the page, pointing to its copy.
 */
const appendMarkdownLink = async (event) => {
  const { filePath, outputDir, outputAdapter } = event.data;
  const path = relative(outputDir, filePath)
    .split(sep)
    .join("/")
    .replace(/\.mdx?$/, "");
  const link = `\n\n[View as Markdown](${COPIES_URL}/${path}.md)\n`;

  const page = outputAdapter?.readFile
    ? await outputAdapter.readFile(filePath)
    : await readFile(filePath, "utf-8");
  const content = `${page.trimEnd()}${link}`;
  if (outputAdapter?.writeFile) {
    await outputAdapter.writeFile(filePath, content);
  } else {
    await saveFile(filePath, content);
  }
};

const queueIndexUpdate = async (indexFilePath, update) => {
  const previous = indexWriteQueue.get(indexFilePath) ?? Promise.resolve();
  const next = previous
    .catch(() => {
      // Keep the queue alive even if a previous write failed.
    })
    .then(update);

  indexWriteQueue.set(indexFilePath, next);
  return next;
};

const afterRenderTypeEntitiesHook = async (event) => {
  if (typeof MkDocsFormatter.afterRenderTypeEntitiesHook === "function") {
    await MkDocsFormatter.afterRenderTypeEntitiesHook(event);
  }

  await appendMarkdownLink(event);

  const { filePath, name } = event.data;
  const indexFilePath = resolve(dirname(filePath), INDEX_MD);
  const pageFileName = basename(filePath);
  const linkLine = `- [${name}](./${pageFileName})`;

  if (!(await fileExists(indexFilePath))) {
    return;
  }

  await queueIndexUpdate(indexFilePath, async () => {
    const indexContent = await readFile(indexFilePath, "utf-8");
    const indexLines = indexContent.split(MARKDOWN_EOL);

    if (indexLines.includes(linkLine)) {
      return;
    }

    if (indexLines[indexLines.length - 1] !== "") {
      indexLines.push("");
    }

    indexLines.push(linkLine);
    await saveFile(indexFilePath, indexLines.join(MARKDOWN_EOL));
  });
};

export default {
  ...mkdocsFormatFunctions,
  mdxExtension,
  beforePrintTypeHook,
  formatMDXAdmonition,
  afterRenderTypeEntitiesHook,
};