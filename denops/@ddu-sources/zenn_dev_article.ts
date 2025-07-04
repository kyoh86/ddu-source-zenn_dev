import type { GatherArguments } from "jsr:@shougo/ddu-vim@~10.3.0/source";
import type { Item } from "jsr:@shougo/ddu-vim@~10.3.0/types";
import { BaseSource } from "jsr:@shougo/ddu-vim@~10.3.0/source";
import * as fn from "jsr:@denops/std@~7.6.0/function";
import { join } from "jsr:@std/path@~1.1.0";
import { basename } from "jsr:@std/path@~1.1.0";
import { extractYaml } from "jsr:@std/front-matter@~1.0.0";
import { abortable } from "jsr:@std/async@~1.0.1";
import { treePath2Filename } from "jsr:@shougo/ddu-vim@~10.3.0/utils";
import type { ActionData, Frontmatter } from "../ddu-zenn_dev/types.ts";

type Params = {
  urlPrefix: string;
  slug: boolean;
};

export class Source extends BaseSource<Params> {
  override kind = "zenn_dev_article";

  override gather(
    args: GatherArguments<Params>,
  ): ReadableStream<Item<ActionData>[]> {
    const abort = new AbortController();
    const path = args.sourceOptions.path;
    const urlPrefix = args.sourceParams.urlPrefix;
    const slug = args.sourceParams.slug;

    return new ReadableStream({
      async start(controller) {
        const cwd = (path && path.length)
          ? treePath2Filename(path)
          : (await fn.getcwd(args.denops));
        const iter = walk(join(cwd, "articles"), urlPrefix, abort.signal, slug);
        try {
          for await (const chunk of iter) {
            controller.enqueue(chunk);
          }
        } catch (e: unknown) {
          if (e instanceof DOMException) {
            return;
          }
          console.error(e);
        } finally {
          controller.close();
        }
      },

      cancel(reason): void {
        abort.abort(reason);
      },
    });
  }

  override params(): Params {
    return {
      urlPrefix: "http://localhost:8000/",
      slug: true,
    };
  }
}

async function* walk(
  cwd: string,
  urlPrefix: string,
  signal: AbortSignal,
  slug: boolean,
) {
  let chunk: Item<ActionData>[] = [];
  for await (const entry of abortable(Deno.readDir(cwd), signal)) {
    if (!/\.md$/.test(entry.name)) {
      continue;
    }
    const abspath = join(cwd, entry.name);
    const stat = await Deno.stat(abspath);

    if (stat === null || stat.isDirectory) {
      console.log(`cannot get file-stat ${entry.name}`);
      continue;
    }

    const attr = await readFrontMatter(abspath);
    if (!attr) {
      console.log(`cannot get front matter ${entry.name}`);
      continue;
    }

    const command = new Deno.Command("git", {
      args: [
        "--no-pager",
        "log",
        "-1",
        "--format=%cs",
        "--",
        abspath,
      ],
      cwd,
      stdout: "piped",
    });
    const output = command.outputSync();
    const date = (output.success)
      ? new TextDecoder().decode(output.stdout).trimEnd()
      : "";

    const prefix = date + " " + (slug ? attr.slug + ": " : "");
    const n = chunk.push({
      word: `${prefix}${attr.emoji} ${attr.title}`,
      action: {
        ...attr,
        path: abspath,
        date,
        url: urlPrefix + join("articles", attr.slug),
      },
    });
    if (n >= 1000) {
      yield chunk;
      chunk = [];
    }
  }
  if (chunk.length) {
    yield chunk;
  }
}

async function readFrontMatter(path: string) {
  try {
    const text = await Deno.readTextFile(path);
    const slug = basename(path).replace(/\.md$/, "");
    return { ...extractYaml<Frontmatter>(text).attrs, slug };
  } catch {
    return undefined;
  }
}
