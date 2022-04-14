import Link from "next/link" // Dynamic routing
import { eth } from "state/eth" // Global state
import { useState } from "react" // State management
import { MenuAlt2Icon } from "@heroicons/react/outline";
interface props{
    setDarkMode: void,
    darkMode: boolean,
    setMobileMenuIsOpen: void,
}

export default function Header(props:any) {
  const { address, unlock, lock } = eth.useContainer()
    // const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false)
  const { setDarkMode, darkMode, setMobileMenuIsOpen} = props;
  return (
    <div className="flex justify-between md:justify-end items-center dark:bg-black">
        <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setMobileMenuIsOpen(true)}
        >
            <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex">
            <div className="flex flex-row align-center md:flex md:flex-row justify-end md:mt-[24px] md:mr-[24px] gap-[16px] mx-4 mt-6">

                <input
                  type="checkbox"
                  name=""
                  id="toggle"
                  className={`w-10 h-10 rounded-full appearance-none border border-gray-800 cursor-pointer ${darkMode === true ? "bg-white" : "bg-black"}`}
                  onChange={(e) => {
                    setDarkMode(e.target.checked);
                  }}
                />
                <div className="mt-0">
                    <button type="button" className="bg-[#00C6ED] rounded-[14px]  w-[188px] md:w-[204px] h-[40px] v-btn v-btn--has-bg theme--light elevation-0 v-size--x-large" role="button" aria-haspopup="true" aria-expanded="false">
                        <span className="v-btn__content">
                            <div className="flex flex-row justify-center mx-[24px] normal-case">
                                <img src="/icons/wallet.svg" alt="" className="mr-[10px]" /> 
                                {!address ?
                                <span className="text-[14px] text-white py-[12px] font-semibold cursor-pointer" onClick={unlock}>Connect Wallet</span>
                                :
                                <span className="text-[14px] text-white py-[12px] font-semibold cursor-pointer overflow-hidden" onClick={lock}>{`${address.substring(0,6)} ... ${address.substring(address.length - 3)}`} </span>
                                }
                            </div>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    )
}