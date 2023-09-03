import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import { signOut, useSession } from "next-auth/react";

export default function UserMenu() {
    const{data}= useSession()
  return (
    <Dropdown>
      <DropdownTrigger>
      <Avatar src={data?.user.image??""} />
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
        <DropdownItem key="delete" onClick={()=>void signOut()}>
          Log out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
