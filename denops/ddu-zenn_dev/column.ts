import {
  BaseColumn,
  DduItem,
} from "https://deno.land/x/ddu_vim@v3.4.1/types.ts";
import { GetTextResult } from "https://deno.land/x/ddu_vim@v3.4.1/base/column.ts";
import { Denops, fn } from "https://deno.land/x/ddu_vim@v3.4.1/deps.ts";
import { ActionData } from "./types.ts";

type Params = Record<never, never>;

export abstract class ZennBaseColumn extends BaseColumn<Params> {
  abstract getAttr({}: ActionData): string;
  abstract getName(): string;

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
    const width = Math.max(...widths);
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
    return Promise.resolve({
      text: this.getAttr(action),
    });
  }

  override params(): Params {
    return {};
  }
}
