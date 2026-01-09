import type { ActionData } from "../../ddu-zenn_dev/types.ts";
import { ZennBaseColumn } from "../../ddu-zenn_dev/column.ts";

export class Column extends ZennBaseColumn {
  getBaseText(): string {
    return "";
  }
  getAttr({ title }: ActionData): string {
    return title;
  }
}
