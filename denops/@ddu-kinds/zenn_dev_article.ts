import { type ActionArguments, ActionFlags } from "@shougo/ddu-vim/types";
import { BaseKind } from "@shougo/ddu-vim/kind";
import { FileActions } from "@shougo/ddu-kind-file";
import { ensure, is, maybe } from "@core/unknownutil";

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
