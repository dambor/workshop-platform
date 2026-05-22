
## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

---

## Creating a New Workshop

### 1. Create the Markdown file

Add a new `.md` file to `public/workshops/`. The filename becomes the workshop's URL slug.

```
public/workshops/my-new-workshop.md  ->  /my-new-workshop
```

The platform auto-discovers all `.md` files in that directory. No registration or configuration needed.

> To keep a file out of the landing page while you work on it, prefix the filename with `_` (e.g., `_draft-workshop.md`). Remove the prefix when it is ready to publish.

### 2. Add frontmatter

Add a frontmatter block at the top of the file to control how the workshop appears on the landing page card:

```markdown
---
title: My Workshop Title
description: A one-sentence summary shown on the landing page card.
---
```

If frontmatter is omitted, the platform falls back to the first `# Heading` as the title and shows "No description available."

### 3. Structure the content

The parser maps Markdown headings to the sidebar navigation:

| Heading | Role |
|---------|------|
| `#`     | Section label (groups steps in the sidebar) |
| `##`    | Step (top-level navigation item) |
| `###`   | Sub-step (nested under its parent step) |

Example structure:

```markdown
---
title: My Workshop
description: Learn how to build X.
---

# Initial Setup

## Create an Account

Steps here...

### Configure Credentials

Sub-steps here...

# Labs

## Lab 1: Build the Flow

Lab content here...
```

### 4. Use special content blocks

**Images**

Place image files in `public/pictures/` and reference them with a relative path. Append `|<width>` inside the alt text to constrain the display width:

```markdown
![](./pictures/my-screenshot.png)
![|60%](./pictures/my-screenshot.png)
```

**Code blocks**

Standard fenced code blocks with optional language highlighting. Add `small` alongside the language to render in a smaller font:

````markdown
```bash
npm install
```

```python small
print("hello")
```
````

**Tips and warnings**

```markdown
> TIP: This is a helpful tip shown in a styled callout.

> WARNING: This is a warning shown in a styled callout.

> NOTE: Plain blockquotes render as regular text with no special styling.
```

**Important / other callouts**

```markdown
> IMPORTANT: This renders as a styled callout similar to WARNING.
```

### 5. Add supporting files

| File type | Location |
|-----------|----------|
| Screenshots and diagrams | `public/pictures/` |
| Downloadable data files (JSON, CSV, TXT, etc.) | `public/data/` |

Reference downloadable files with an HTML anchor using the `download` attribute:

```html
<a href="../data/my-file.json" download="my-file.json" class="text-blue-400 hover:text-blue-300 underline underline-offset-4">my-file.json</a>
```

### 6. Verify locally

Run `npm run dev` and open `http://localhost:3000`. Your workshop will appear on the landing page and be accessible at `http://localhost:3000/my-new-workshop`.
