import { BaseKind } from "https://deno.land/x/ddu_vim@v3.6.0/types.ts";
import { FileActions } from "https://deno.land/x/ddu_kind_file@v0.7.1/file.ts";
import { UrlActions } from "https://denopkg.com/4513ECHO/ddu-kind-url@master/denops/@ddu-kinds/url.ts";

type Params = {
  trashCommand: string[];
  externalOpener: "openbrowser" | "external" | "systemopen" | "uiopen";
};

export class Kind extends BaseKind<Params> {
  actions = {
    ...FileActions,
    browse: UrlActions.browse,
  };

  override params(): Params {
    return {
      trashCommand: [],
      externalOpener: "systemopen",
    };
  }
}
