import { ActionData } from "../ddu-zenn_dev/types.ts";
import { ZennBaseColumn } from "../ddu-zenn_dev/column.ts";

export class Column extends ZennBaseColumn {
  getBaseText(): string {
    return "0123456789abcdef";
  }
  getAttr({ slug }: ActionData): string {
    return slug;
  }
}
