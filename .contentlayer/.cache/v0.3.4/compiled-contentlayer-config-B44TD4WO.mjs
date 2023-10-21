// contentlayer.config.js
import { makeSource, defineDocumentType } from "@contentlayer/source-files";
var Doc = defineDocumentType(() => ({
  name: "Blog",
  filePathPattern: "**/**/*.mdx",
  fields: {
    title: {
      type: "string"
    },
    publishedAt: {
      type: "date",
      required: true
    },
    updatedAt: {
      type: "date",
      required: true
    },
    description: {
      type: "string",
      required: true
    },
    image: { type: "string" },
    isPublished: {
      type: "boolean",
      required: true,
      default: true
    },
    author: {
      type: "string",
      required: true
    },
    tags: {
      type: "list",
      of: {
        type: "string"
      }
    },
    majorTag: {
      type: "string",
      required: true
    }
  },
  computedFields: {
    url_path: {
      type: "string",
      resolve: (doc) => `/blog/${doc._raw.flattenedPath}`
    }
  }
}));
var Doc2 = defineDocumentType(() => ({
  name: "Blog",
  filePathPattern: "**/**/**/**/**/*.mdx",
  fields: {
    title: {
      type: "string"
    },
    publishedAt: {
      type: "date",
      required: true
    },
    updatedAt: {
      type: "date",
      required: true
    },
    description: {
      type: "string",
      required: true
    },
    image: { type: "image" },
    isPublished: {
      type: "boolean",
      required: true,
      default: true
    },
    author: {
      type: "string",
      required: true
    },
    tags: {
      type: "list",
      of: {
        type: "string"
      }
    },
    majorTag: {
      type: "string",
      required: true
    }
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (doc) => `/${doc._raw.flattenedPath}`
    },
    readingTime: {
      type: "json",
      resolve: (doc) => readingTime(doc.body.raw)
    },
    toc: {
      type: "json",
      resolve: async (doc) => {
        const regulrExp = /\n(?<flag>#{1,6})\s+(?<content>.+)/g;
        const slugger = new GithubSlugger();
        const headings = Array.from(doc.body.raw.matchAll(regulrExp)).map(
          ({ groups }) => {
            const flag = groups?.flag;
            const content = groups?.content;
            return {
              level: flag?.length == 1 ? "one" : flag?.length == 2 ? "two" : "three",
              text: content,
              slug: content ? slugger.slug(content) : void 0
            };
          }
        );
        return headings;
      }
    }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "content",
  documentTypes: [Doc, Doc2]
});
export {
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-B44TD4WO.mjs.map
