import {
  ActionArguments,
  ActionFlags,
  BaseKind,
} from "https://deno.land/x/ddu_vim@v3.10.3/types.ts";
import { FileActions } from "https://deno.land/x/ddu_kind_file@v0.7.1/file.ts";
import {
  ensure,
  is,
  maybe,
} from "https://deno.land/x/unknownutil@v3.17.2/mod.ts";

type Params = {
  trashCommand: string[];
  externalOpener: "openbrowser" | "external" | "systemopen" | "uiopen";
};

export class Kind extends BaseKind<Params> {
  actions = {
    ...FileActions,
    browse: async (
      { denops, items, actionParams }: ActionArguments<Params>,
    ) => {
      const params = ensure(actionParams, is.Record);
      const opener = maybe(params.opener, is.String);
      for (const item of items) {
        const action = item?.action as { url: string };
        await denops.call(
          "denops#notify",
          "ddu-kind-zenn_dev_article",
          "open",
          [
            action.url,
            opener,
          ],
        );
      }
      return ActionFlags.None;
    },
  };

  override params(): Params {
    return {
      trashCommand: [],
      externalOpener: "systemopen",
    };
  }
}
