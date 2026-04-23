# GraphQL Documentation

Browse the GraphQL schema documentation for this API.

## Configuration

This documentation is generated using GraphQL-Markdown with the MkDocs formatter and a small wrapper for Read the Docs friendly output.

### Generation Pipeline

1. The MkDocs formatter preset provides Markdown compatible link handling and admonition output.
2. The custom wrapper creates per-section `index.md` files and renders titles as visible headings.
3. MkDocs serves the generated files with the Read the Docs theme.

### Key Files

- `scripts/generate-docs.mjs` runs GraphQL-Markdown programmatically.
- `scripts/custom-mkdocs-mdx.mjs` adds MkDocs-specific lifecycle hooks.
- `schema.graphql` is the source GraphQL schema.
- `mkdocs.yml` configures the MkDocs site.
