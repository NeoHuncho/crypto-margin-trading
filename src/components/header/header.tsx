import { AppShell } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import icon from "~/images/icon.png";
import UserMenu from "./userMenu";

export default function NavbarComponent() {
  return (
    <AppShell.Header>
      <div className="grid w-full grid-cols-3 items-center  px-3">
        <div className="flex items-center gap-2">
          <Image src={icon} alt="Logo" width={50} />
          <p className="text-xl font-bold text-inherit dark:text-white">CMT</p>
        </div>
        <Link
          className="justify-self-center font-extrabold text-white no-underline "
          href="/dashboard"
        >
          Dashboard
        </Link>
        <div className="justify-self-end">
          <UserMenu />
        </div>
      </div>
    </AppShell.Header>
  );
}
