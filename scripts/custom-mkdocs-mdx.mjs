import { basename, dirname, resolve } from "node:path";

import {
  fileExists,
  MARKDOWN_EOL,
  readFile,
  saveFile,
} from "@graphql-markdown/utils";

import MkDocsFormatter from "@graphql-markdown/formatters/mkdocs";

const mkdocsFormatFunctions =
  typeof MkDocsFormatter.createMDXFormatter === "function"
    ? MkDocsFormatter.createMDXFormatter()
    : MkDocsFormatter;

const INDEX_MD = "index.md";
export const mdxExtension = ".md";
const indexWriteQueue = new Map();

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
  afterRenderTypeEntitiesHook,
};