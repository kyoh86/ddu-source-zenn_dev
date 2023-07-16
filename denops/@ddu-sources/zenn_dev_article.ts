import type { GatherArguments } from "https://deno.land/x/ddu_vim@v3.4.2/base/source.ts";
import { BaseSource, Item } from "https://deno.land/x/ddu_vim@v3.4.2/types.ts";
import { fn } from "https://deno.land/x/ddu_vim@v3.4.2/deps.ts";
import { join } from "https://deno.land/std@0.194.0/path/mod.ts";
import { basename } from "https://deno.land/std@0.194.0/path/mod.ts";
import { extract } from "https://deno.land/std@0.194.0/front_matter/any.ts";
import { abortable } from "https://deno.land/std@0.194.0/async/mod.ts";
import { treePath2Filename } from "https://deno.land/x/ddu_vim@v3.4.2/utils.ts";
import { ActionData, Frontmatter } from "../ddu-zenn_dev/types.ts";

type Params = {
  urlPrefix: string;
};

export class Source extends BaseSource<Params> {
  kind = "file";

  override gather(
    args: GatherArguments<Params>,
  ): ReadableStream<Item<ActionData>[]> {
    const abort = new AbortController();
    const path = args.sourceOptions.path;
    const urlPrefix = args.sourceParams.urlPrefix;

    return new ReadableStream({
      async start(controller) {
        const cwd = (path && path.length)
          ? treePath2Filename(path)
          : (await fn.getcwd(args.denops));
        const iter = walk(join(cwd, "articles"), urlPrefix, abort.signal);
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
    return { urlPrefix: "http://localhost:8000/" };
  }
}

async function* walk(cwd: string, urlPrefix: string, signal: AbortSignal) {
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
    const n = chunk.push({
      word: `${attr.slug}: ${attr.emoji} ${attr.title}`,
      action: {
        ...attr,
        path: abspath,
        url: join(
          urlPrefix,
          "articles",
          attr.slug,
        ),
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
    return { ...extract<Frontmatter>(text).attrs, slug };
  } catch {
    return undefined;
  }
}
