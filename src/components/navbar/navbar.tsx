import { Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import Image from "next/image";
import icon from '~/images/icon.png';
import UserMenu from "./userMenu";

export default function NavbarComponent() {

  return (
    <Navbar maxWidth="full" className="dark">
      <NavbarBrand>
        <Image src={icon} alt="Logo" width={50} />
        <p className="font-bold text-inherit text-xl dark:text-white">CMT</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem isActive >
          <Link href="/dashboard" aria-current="page">
            Dashboard
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem >
          <UserMenu/>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
