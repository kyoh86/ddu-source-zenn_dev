import {
  BaseColumn,
  DduItem,
} from "https://deno.land/x/ddu_vim@v3.4.1/types.ts";
import { GetTextResult } from "https://deno.land/x/ddu_vim@v3.4.1/base/column.ts";
import { Denops, fn } from "https://deno.land/x/ddu_vim@v3.4.1/deps.ts";
import { ActionData } from "./types.ts";

type Params = {
  limitLength: number;
};

export abstract class ZennBaseColumn extends BaseColumn<Params> {
  #width = 1;

  abstract getAttr({}: ActionData): string;

  override async getLength(args: {
    denops: Denops;
    columnParams: Params;
    items: DduItem[];
  }): Promise<number> {
    const widths = await Promise.all(args.items.map(
      async (item) => {
        const action = item?.action as ActionData;

        return await fn.strwidth(args.denops, this.getAttr(action));
      },
    ));
    let width = Math.max(...widths, this.#width);
    if (args.columnParams.limitLength) {
      width = Math.min(width, args.columnParams.limitLength);
    }
    this.#width = width;
    return Promise.resolve(width);
  }

  override getText(args: {
    denops: Denops;
    columnParams: Params;
    startCol: number;
    endCol: number;
    item: DduItem;
  }): Promise<GetTextResult> {
    const action = args.item?.action as ActionData;
    const text = this.getAttr(action);
    const padding = " ".repeat(Math.max(this.#width - text.length, 0));
    return Promise.resolve({
      text: text + padding,
    });
  }

  override params(): Params {
    return { limitLength: 0 };
  }
}
