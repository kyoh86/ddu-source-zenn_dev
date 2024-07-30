import type { ActionData } from "../ddu-zenn_dev/types.ts";
import { ZennBaseColumn } from "../ddu-zenn_dev/column.ts";

export class Column extends ZennBaseColumn {
  getAttr({ emoji }: ActionData): string {
    return emoji;
  }

  override getLength(_: unknown): Promise<number> {
    return Promise.resolve(2);
  }

  getBaseText(): string {
    return "😀";
  }
}
