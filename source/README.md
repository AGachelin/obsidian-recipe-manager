## Introduction

This repository implements interactive recipe notes and a searchable recipe index for [Obsidian](https://obsidian.md), with js-engine, Meta Bind, and optional Dataview. The [Hover Editor](https://github.com/nothingislost/obsidian-hover-editor) plugin is recommended, otherwise the recipe body has to be manually modified in `content.md` files. Recipe pages support read/edit modes, ingredient scaling, ratings and thumbnails amongst other miscellaneous parameters. The index page offers advanced filters, folder-grouped results and fast recipe creation.

## Requirements

| Component                                                         | Role                                                           |
| ----------------------------------------------------------------- | -------------------------------------------------------------- |
| [js-engine](https://github.com/saml-dev/js-engine)                | Runs js code in .md files through js-engine blocks             |
| [Meta Bind](https://github.com/mProjects-Code/obsidian-meta-bind) | Inputs, buttons, and live frontmatter bindings                 |
| [Templater](https://github.com/SilentVoid13/Templater)            | Recipe creation                                                |
| [Dataview](https://github.com/blacksmithgu/obsidian-dataview)     | Faster index queries when installed (falls back to vault scan) |

Files in the `snippets` folder have to be copied to the `.obsidian/snippets` folder. The CSS snippets should then be enabled in Obsidian (Settings → Appearance → CSS snippets).

`src/shared/startup/startup.js` needs to be set as a startup script for `js-engine`.

## Vault layout

```
recipes/                 # git / vault root
├── Recipes/             # all recipe notes (required folder name)
│   └── <category>/
│       └── <name>/
│           ├── <name>.md    # recipe frontmatter + js-engine block
│           └── content.md   # free-form body (excluded from index)
├── source/              # source code (JS + templates + snippets)
│   ├── src/
│   ├── templates/
│   └── snippets/
└── Ingredients/         # available ingredients
```

Stable entry URLs for templates :

- Recipe page: `source/src/lib/recipe-live.js` → `setupRecipeLive`
- Index page: `source/src/lib/frontpage-live.js` → `setupFrontpageLive`

## Languages (English / French)

UI strings are defined in `src/shared/i18n/labels.js` for `en` and `fr` (anything else is treated as `en`).

If the language isn't specified as the last argument of the  js-engine setup call in notes, the UI falls back to Obsidian's locale then to English.
## Project structure

```
src/
├── lib/
│   ├── recipe/           # Recipe rendering
│   ├── frontpage/        # Frontpage rendering
│   └── render/           # Meta Bind layout helpers, subscriptions
├── components/
│   ├── recipe-fields/    # Recipe - specific components
│   ├── frontpage/        # Frontpage - specific components
│   └── shared/           # Shared components
├── shared/
│   ├── i18n/             # Language resolution + label getters
│   ├── constants/        # Frontmatter keys, layout CSS class names
│   ├── vault/            # Recipe file walks, thumbnail URLs, grouping
│   └── startup/          # startup script : Math units + plugin init for Meta Bind
└── components/README.md  # Widget contract for new fields
```

## Creating notes

- **New recipe**: run the Templater template `source/templates/recipe.md` (or the “New recipe” button on the index). It creates `Recipes/<type>/<title>/<title>.md` plus `content.md`.
- **Ingredients**: created through the "New ingredient" button in any recipe. It creates `Ingredients/<title>.md`. Can also be created by manually adding a file to the `Ingredients` folder and running the Templater template `source/templates/ingredient_template.md`
