declare module "@zilliz/zui/dist/core/ZIcons/newIcons" {
  import { FC, SVGProps } from "react";
  interface ZIconProps extends SVGProps<SVGSVGElement> {
    sx?: Record<string, unknown>;
  }
  export const DocsIcon: FC<ZIconProps>;
  export const ImIcon: FC<ZIconProps>;
  export const MsnIcon: FC<ZIconProps>;
  export const Arrow2RightIcon: FC<ZIconProps>;
  export const SupportIcon: FC<ZIconProps>;
}
