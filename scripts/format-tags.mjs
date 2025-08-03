import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), '_posts');

async function formatTags() {
  const fileNames = fs.readdirSync(postsDirectory);

  for (const fileName of fileNames) {
    if (path.extname(fileName) !== '.md') {
      continue;
    }

    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    if (data.tags && Array.isArray(data.tags)) {
      const newTags = data.tags.map(tag => {
        if (typeof tag === 'string') {
          return tag.toLowerCase().replace(/\s+/g, '-');
        }
        return tag;
      });

      const newData = { ...data, tags: newTags };
      const newFileContents = matter.stringify(content, newData);
      fs.writeFileSync(fullPath, newFileContents);
      console.log(`Formatted tags in ${fileName}`);
    }
  }
}

formatTags();
