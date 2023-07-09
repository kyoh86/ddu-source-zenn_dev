import { ActionData } from "../ddu-zenn_dev/types.ts";
import { ZennBaseColumn } from "../ddu-zenn_dev/column.ts";

export class Column extends ZennBaseColumn {
  getAttr({ title }: ActionData): string {
    return title;
  }
}
