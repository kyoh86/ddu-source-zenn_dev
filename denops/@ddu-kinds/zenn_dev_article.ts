import {
  type ActionArguments,
  ActionFlags,
  BaseKind,
} from "jsr:@shougo/ddu-vim@~5.0.0/types";
import { FileActions } from "jsr:@shougo/ddu-kind-file@~0.8.0";
import { ensure, is, maybe } from "jsr:@core/unknownutil@~3.18.1";

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
