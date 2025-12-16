import type { ActionData as FileActionData } from "@shougo/ddu-kind-file";

export type Frontmatter = { title: string; emoji: string };
export type PostAttribute =
  & { slug: string; url: string; date: string }
  & Frontmatter;
export type ActionData = FileActionData & PostAttribute;
