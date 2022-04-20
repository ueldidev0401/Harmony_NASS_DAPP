import Link from "next/link"; // Dynamic routing
import Router from "next/router"
import Image from "next/image"; // Images
import { eth } from "state/eth"; // Global state
import { useEffect, useState } from "react"; // State management
import cn from "classnames"
import { XIcon } from "@heroicons/react/outline";

import styles from "styles/components/Header.module.scss"; // Component styles

interface props{
  mobileMenuIsOpen: boolean
  setMobileMenuIsOpen: void
}


/**
 * Links to render in action menu
 * @dev Does not render any links where url is undefined, allowing conditional rendering
 */
const actionMenuLinks: {
  name: string;
  icon: string;
  url: string | undefined;
}[] = [
  {
    name: "About",
    icon: "/icons/info.svg",
    url: process.env.NEXT_PUBLIC_ARTICLE,
  },
  {
    name: "Discord",
    icon: "/icons/discord.svg",
    url: process.env.NEXT_PUBLIC_DISCORD,
  },
  {
    name: "Twitter",
    icon: "/icons/twitter.svg",
    url: process.env.NEXT_PUBLIC_TWITTER,
  },
  {
    name: "GitHub",
    icon: "/icons/github.svg",
    url: process.env.NEXT_PUBLIC_GITHUB,
  },
];

export default function Nav(props:any) {
  // Global state
  const { address, unlock }: { address: string | null; unlock: Function } =
    eth.useContainer();
    const { mobileMenuIsOpen, setMobileMenuIsOpen } = props;

  const [pathname, setPathname] = useState('')
  useEffect(() => {
    setPathname(Router.asPath)
  })

  return (
      <nav className={cn(mobileMenuIsOpen?"translate-x-0":"-translate-x-full md:translate-x-0","block transition ease-in-out duration-500 transform md:block w-full md:w-[244px] z-[1] h-[100%] fixed overflow-hidden bg-[#f7f8fa] dark:bg-[#1f2937]")} 
        style={{height: "100vh", top: "0px", maxHeight: "calc(100% - 0px)"}}
      >
        <div className="absolute top-0 right-0 pt-2  md:hidden">
          <button
            type="button"
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setMobileMenuIsOpen(false)}
          >
            <XIcon className="h-6 w-6 text-gray-900 dark:text-gray-100" aria-hidden="true" />
          </button>
        </div>
        <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex flex-col items-center">
                <div className="flex flex-row justify-center mt-[44px] mb-[30px] md:mb-[100.3px]">
                  <img src="/img/honeIcon.png" alt="" className="w-[64px] h-[63.7px]" />
                  <span style={{fontSize: "xx-large", lineHeight: 2}} className="dark:text-gray-300">Harmony</span> 
                </div>
                {[
                  { title: "Dashboard", route: "/", icon:"/img/homeIcon.svg"},
                  { title: "Buy Nodes", route: "/buynodes", icon:"/img/nodesIcon.svg" },
                  { title: "Merge", route: "/merge", icon:"/img/nodesIcon.svg" },
                  { title: "Rent", route: "/rent", icon:"/img/nodesIcon.svg" },
                ].map(({ route, title, icon }) => (
                  <Link href={route} passHref key={title}>
                    <a className={cn("flex m-auto hover:bg-[#00c6ed] w-[188px] h-[46px] rounded-[10px] mx-[28px] mb-[14px] md:mb-[30px]", pathname == route?"bg-[#00c6ed]": "bg-transparent dark:bg-[#1f2937]")}>
                      <img src={icon} alt="" className="mx-[23.5px] my-auto h-1/2" /> 
                      <div className="my-auto">
                        <div className="text-[14px] text-gray-900 dark:text-gray-100">{title}</div>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
            <div className="mb-6 flex flex-col items-center">
              {[
                { title: "Follow Us!", route: "https://twitter.com/", icon:"/icons/contact.svg"},
                { title: "Join Discord", route: "https://discord.gg", icon:"/icons/discord.svg" },
                { title: "Governance", route: "https://snapshot.org/", icon:"/icons/governanceIcon.svg" },
              ].map(({ route, title, icon }) => (
                <div className="ml-[24px] mb-[14px] md:mb-[28px]" key={title}>
                  <a href={route} target="_blank" rel="noreferrer">
                    <div className="flex flex-row mx-[41.5px]">
                      <img src={icon} alt="" className="mr-[10px] w-[24px] h-[24px]" /> 
                      <span className="text-[#00C6ED] text-[14px]">{title}</span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
        </div>
      </nav>
  );
}
