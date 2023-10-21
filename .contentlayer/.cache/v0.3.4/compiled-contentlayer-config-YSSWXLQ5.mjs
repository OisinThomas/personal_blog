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
      resolve: (doc) => `/${doc._raw.flattenedPath}`
    }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "content",
  documentTypes: [Doc]
});
export {
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-YSSWXLQ5.mjs.map
