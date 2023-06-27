import type { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
import type { GatherArguments } from "https://deno.land/x/ddu_vim@v3.2.7/base/source.ts";
import type { ActionData as FileActionData } from "https://deno.land/x/ddu_kind_file@v0.5.2/file.ts";

import { BaseSource, Item } from "https://deno.land/x/ddu_vim@v3.2.7/types.ts";
import { TextLineStream } from "https://deno.land/std@0.192.0/streams/text_line_stream.ts";
import { join } from "https://deno.land/std@0.192.0/path/mod.ts";
import { ChunkedStream } from "https://deno.land/x/chunked_stream@0.1.2/mod.ts";
import {
  JSONLinesParseStream,
  JSONValue,
} from "https://deno.land/x/jsonlines@v1.2.2/mod.ts";

export class EchomsgStream extends WritableStream<string> {
  #cmd = "echomsg";
  constructor(denops: Denops, source: string, errorMsg: boolean = false) {
    super({
      write: async (chunk, _controller) => {
        await denops.cmd(`${this.#cmd} '[${source}]' chunk`, { chunk });
      },
    });
    if (errorMsg) {
      this.#cmd = "echoerr";
    }
  }
}

type ActionData = FileActionData;

type Params = {
  cwd: string;
  urlPrefix: string;
  useNpx: boolean;
};

type Article = {
  title: string;
  emoji: string;
  type: string;
  topics?: (string)[] | null;
  published: boolean;
  slug: string;
};

export class Source extends BaseSource<Params, ActionData> {
  override kind = "file";

  override gather(
    args: GatherArguments<Params>,
  ): ReadableStream<Item<ActionData>[]> {
    const cwd = args.sourceParams.cwd;
    if (cwd == "") {
      throw new Error("You should set sourceParams.cwd");
    }
    const urlPrefix = args.sourceParams.urlPrefix;
    if (urlPrefix == "") {
      throw new Error("You should set sourceParams.urlPrefix");
    }
    return this.listProjects(args.denops, args.sourceParams)
      .pipeThrough(new ChunkedStream({ chunkSize: 1000 }));
  }

  private listProjects(
    denops: Denops,
    params: Params,
  ) {
    const cmd = params.useNpx ? "npx" : "zenn-cli";
    const args = (params.useNpx ? ["zenn-cli"] : []).concat([
      "list:articles",
      "--format",
      "json",
    ]);
    const { status, stderr, stdout } = new Deno.Command(cmd, {
      args,
      stdin: "null",
      stderr: "piped",
      stdout: "piped",
      cwd: params.cwd,
    }).spawn();
    status.then((status) => {
      if (!status.success) {
        stderr
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(new TextLineStream())
          .pipeTo(new EchomsgStream(denops, "source-zenn-dev", true));
      }
    });
    return stdout
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new JSONLinesParseStream())
      .pipeThrough(
        new TransformStream<JSONValue, Item<ActionData>>({
          transform: (value, controller) => {
            this.parseJSON(params, value, controller);
          },
        }),
      );
  }

  private parseJSON(
    params: Params,
    value: unknown,
    controller: TransformStreamDefaultController<Item<FileActionData>>,
  ) {
    const article = value as Article;
    controller.enqueue({
      word: `${article.title} (${article.slug}`,
      display: `${article.emoji} ${article.title} (${article.slug})`,
      action: {
        path: join(
          params.cwd,
          "articles",
          `${article.slug}.md`,
        ),
        url: join(
          params.urlPrefix,
          "articles",
          article.slug,
        ),
      },
    });
  }

  override params(): Params {
    return {
      cwd: "",
      urlPrefix: "http://localhost:8000",
      useNpx: true,
    };
  }
}
