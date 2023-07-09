import { ActionData } from "../ddu-zenn_dev/types.ts";
import { ZennBaseColumn } from "../ddu-zenn_dev/column.ts";

export class Column extends ZennBaseColumn {
  override #width = 2;

  getAttr({ emoji }: ActionData): string {
    return emoji;
  }

  override getLength(_: unknown): Promise<number> {
    return Promise.resolve(2);
  }
}
