import { parseISO, compareDesc, parse } from "date-fns";

export const cx = (...classNames) => classNames.filter(Boolean).join(" ");

export const sortBlogs = (blogs) => {
  let today = new Date();
  return blogs.filter(a => today > parseISO(a.publishedAt)).sort((a, b) => {
    return compareDesc(parseISO(a.publishedAt), parseISO(b.publishedAt));
  });
};
