import type { ActionData as FileActionData } from "jsr:@shougo/ddu-kind-file@~0.8.0";

export type Frontmatter = { title: string; emoji: string };
export type PostAttribute =
  & { slug: string; url: string; date: string }
  & Frontmatter;
export type ActionData = FileActionData & PostAttribute;
