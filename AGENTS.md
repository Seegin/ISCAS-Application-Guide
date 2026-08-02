# Repository Guidelines

## Project Structure & Module Organization

This repository is a Chinese-language, content-first MkDocs site. `README.md` is the home page; guides live in `初试准备/` and `复试准备/`, while first-hand accounts live in `上岸经验分享/`. Supporting spreadsheets are stored beside the guide that uses them. `经验分享投稿模板.md` is the submission template, and `CONTRIBUTORS.md` records contributors.

Site configuration and navigation are defined in `mkdocs.yml`. Theme templates, CSS, JavaScript, and images live under `overrides/`. `anonymize.py` sanitizes copied content during builds. Treat `docs_src/` and `site/` as generated output; do not edit or commit them.

## Build, Test, and Development Commands

- `bash build-site.sh` installs `mkdocs-material` when needed, copies source content into `docs_src/`, anonymizes that copy, and builds the site into `site/`.
- `python -m mkdocs serve` serves an already prepared `docs_src/` tree for local preview. Run the build script first so the generated tree is current.
- `python anonymize.py docs_src` reruns only the sanitization pass when debugging replacement rules.

No separate dependency manifest or automated test suite is present. A clean MkDocs build is the required validation.

## Coding Style & Naming Conventions

Write Markdown as UTF-8, use descriptive Chinese headings, relative links, and concise paragraphs. Follow the structure in `经验分享投稿模板.md` for new accounts. Name content files after their visible article titles, for example `上岸经验分享/双非一本一战上岸国科大软件所.md`, and add every new page to `nav` in `mkdocs.yml`.

For Python, use four-space indentation, `snake_case`, uppercase module constants, and type hints where practical. Preserve existing two-space indentation in CSS and JavaScript. Keep Bash scripts compatible with strict mode (`set -euo pipefail`).

## Testing Guidelines

Before submitting, run `bash build-site.sh` and resolve warnings about missing pages, broken navigation, or invalid configuration. Open `site/index.html` or serve the generated site and check changed links, tables, images, mobile layout, and both color schemes. Changes to anonymization must be verified against copied files in `docs_src/`; source articles must remain unchanged.

## Commit & Pull Request Guidelines

Recent commits use short, descriptive subjects, usually in Chinese, such as `补充补助细则` or a scoped form like `docs: add hyperlink for ICT in README`. Keep each commit focused. Pull requests should explain the content or behavior changed, identify relevant issues or information sources, and include before/after screenshots for theme or layout work. Do not include personal contact details or generated directories.
