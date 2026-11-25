import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { runGraphQLMarkdown } from "@graphql-markdown/cli";

import { decorators } from "../lib/decorators.mjs";

const customMDX = pathToFileURL(
  resolve("./scripts/custom-mkdocs-mdx.mjs"),
).href;

rmSync(resolve("./docs/graphql"), { force: true, recursive: true });

await runGraphQLMarkdown(
  {
    // Shared schema documented by every GraphQL-Markdown demo.
    schema:
      "https://raw.githubusercontent.com/graphql-markdown/graphql-markdown/main/tests/e2e/__data__/demo_schema.graphql",
    rootPath: "./docs",
    baseURL: "graphql",
    homepage: "./index.md",
    formatter: customMDX,
    loaders: {
      UrlLoader: "@graphql-tools/url-loader",
    },
    decorators,
    pretty: true,
    force: true,
    telemetry: false,
    docOptions: {
      sectionHeaderId: false,
    },
  },
  {},
);

console.log("GraphQL docs generated in docs/graphql");