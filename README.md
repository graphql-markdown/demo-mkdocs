# GraphQL-Markdown + MkDocs demo

This project demonstrates how to generate GraphQL documentation with GraphQL-Markdown for a MkDocs site using the Read the Docs theme.

**Live demo:** https://graphql-markdown.github.io/demo-mkdocs/

## Quick start

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:8000/` and use the GraphQL API entry in the navigation.

## Project structure

```text
.
├── docs/
│   ├── graphql/                # Generated GraphQL documentation
│   ├── index.md                # Demo home page
│   └── stylesheets/
│       └── gqlmd.css           # Badge styling
├── schema.graphql              # Sample GraphQL schema
├── scripts/
│   ├── custom-mkdocs-mdx.mjs   # Wrapper that extends the MkDocs preset with section index links
│   └── generate-docs.mjs       # GraphQL-Markdown runner
├── theme-overrides/
│   └── footer.html             # Read the Docs theme footer override
├── mkdocs.yml                  # MkDocs configuration
└── package.json
```

## Notes

- The preset `@graphql-markdown/formatters/mkdocs` now provides:
  - Visible page titles as `# H1` headings
  - HTML `<details>` collapsible blocks
  - Post-render internal link rewriting to page-relative `.md` links
- The demo wrapper keeps one demo-specific behavior: appending generated entity links to per-section `index.md` files.
- The Read the Docs footer attribution is overridden through `theme-overrides/footer.html`.
