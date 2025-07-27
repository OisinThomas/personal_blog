import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import TurndownService from 'turndown';

const turndownService = new TurndownService();

const postsCsvPath = path.join(process.cwd(), '9DqYLHVcRsOctpWXCLmfJg/posts.csv');
const postsDir = path.join(process.cwd(), '9DqYLHVcRsOctpWXCLmfJg/posts');
const outputDir = path.join(process.cwd(), '_posts');

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const postsCsv = fs.readFileSync(postsCsvPath, 'utf8');

Papa.parse(postsCsv, {
  header: true,
  complete: (results) => {
    results.data.forEach((post) => {
      if (!post.post_id || !post.title) {
        return;
      }

      const slug = slugify(post.title);
      const htmlFilePath = path.join(postsDir, `${post.post_id}.${slugify(post.title.split(' ')[0])}.html`);
      
      // A fallback for the filenames that are not perfectly matching
      const potentialHtmlFileName = fs.readdirSync(postsDir).find(file => file.startsWith(post.post_id));
      const finalHtmlFilePath = potentialHtmlFileName ? path.join(postsDir, potentialHtmlFileName) : htmlFilePath;

      if (fs.existsSync(finalHtmlFilePath)) {
        const htmlContent = fs.readFileSync(finalHtmlFilePath, 'utf8');
        const markdownContent = turndownService.turndown(htmlContent);

        const majorTag =
          post.title.includes('Silicon in Irish') || post.title.includes('Irish in Silicon')
            ? 'Tinkering'
            : 'Thoughts';

        const frontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
description: "${post.subtitle ? post.subtitle.replace(/"/g, '\\"') : ''}"
publishedAt: "${post.post_date}"
updatedAt: "${post.post_date}"
author: "Oisín Thomas"
image: "/profile.png"
majorTag: "${majorTag}"
subTag: "Tech"
language: "en"
available: true
source: "Substack"
substackUrl: "https://caideiseach.substack.com/p/${slug}"
tags: []
---

${markdownContent}
`;

        fs.writeFileSync(path.join(outputDir, `${slug}.md`), frontmatter);
      }
    });
  },
});
