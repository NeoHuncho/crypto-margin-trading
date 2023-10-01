import { Avatar, Menu } from "@mantine/core";
import { signOut, useSession } from "next-auth/react";

export default function UserMenu() {
  const { data } = useSession();

  return (
    <Menu>
      <Menu.Target>
        <Avatar className="cursor-pointer" src={data?.user.image ?? ""} />
      </Menu.Target>
      <Menu.Dropdown aria-label="Static Actions">
        <Menu.Item key="delete" onClick={() => void signOut()}>
          Log out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
