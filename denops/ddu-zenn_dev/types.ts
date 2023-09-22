import { ActionData as FileActionData } from "https://deno.land/x/ddu_kind_file@v0.7.1/file.ts";

export type Frontmatter = { title: string; emoji: string };
export type PostAttribute = { slug: string } & Frontmatter;
export type ActionData = FileActionData & PostAttribute;
