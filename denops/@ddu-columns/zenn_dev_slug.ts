import { ActionData } from "../ddu-zenn_dev/types.ts";
import { ZennBaseColumn } from "../ddu-zenn_dev/column.ts";

export class Column extends ZennBaseColumn {
  getName(): string {
    return "slug";
  }
  getAttr({ slug }: ActionData): string {
    return slug;
  }
}
