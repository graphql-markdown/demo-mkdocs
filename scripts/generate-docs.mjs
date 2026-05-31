import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { runGraphQLMarkdown } from "@graphql-markdown/cli";

const customMDX = pathToFileURL(
  resolve("./scripts/custom-mkdocs-mdx.mjs"),
).href;

rmSync(resolve("./docs/graphql"), { force: true, recursive: true });

await runGraphQLMarkdown(
  {
    schema: "./schema.graphql",
    rootPath: "./docs",
    baseURL: "graphql",
    homepage: "./index.md",
    formatter: customMDX,
    loaders: {
      GraphQLFileLoader: "@graphql-tools/graphql-file-loader",
    },
    pretty: true,
    force: true,
    docOptions: {
      sectionHeaderId: false,
    },
  },
  {},
);

console.log("GraphQL docs generated in docs/graphql");