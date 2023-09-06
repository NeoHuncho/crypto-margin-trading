import { BsFillTrashFill, BsPlusCircleFill } from "react-icons/bs";
export type IconProps = {
  size?: number;
  className?: string;
  onClick?: () => void;
  color?: string;
  style?: React.CSSProperties;
};
export type IconType = React.FC<IconProps & { name: keyof typeof icons }>;
export type IconNames = keyof typeof icons;

export const icons = {
  CirclePlus: BsPlusCircleFill,
  Trash: BsFillTrashFill,
  // add your icons here
};
export const Icon: React.FC<IconProps & { name: keyof typeof icons }> = ({
  name,
  color,
  className,
  ...props
}) => {
  const IconComponent = icons[name];
  return <IconComponent className={className} {...props} />;
};
