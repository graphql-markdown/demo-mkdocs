// GraphQL-Markdown emits field/argument names as self links (`href="#"`)
// because section header ids are disabled. Point each one at the heading
// MkDocs generated for it, so the name works as a permalink.
document
  .querySelectorAll(".rst-content :is(h3, h4, h5)[id] > a[href='#']")
  .forEach((link) => {
    link.href = `#${link.parentElement.id}`;
    link.classList.add("gqlmd-permalink");
  });
