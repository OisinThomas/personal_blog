import { parseISO, compareDesc } from "date-fns";

export const cx = (...classNames) => classNames.filter(Boolean).join(" ");

export const sortBlogs = (blogs) => {
  return blogs.sort((a, b) => {
    return compareDesc(parseISO(a.publishedAt), parseISO(b.publishedAt));
  });
};
