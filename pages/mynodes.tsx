import { eth } from "state/eth"; // Global state: ETH
import { useState } from "react"; // State management
import { token } from "state/token"; // Global state: Tokens
import { toast } from "react-toastify"
import classNames from "classnames"
import {formatNumber} from "utils/formatBalance";

export default function MyNodes() {
  // Global ETH state
  const { address, unlock }: { address: string | null; unlock: Function } =
    eth.useContainer();
  // Global token state
  const { info, approveUSDC, multicall, payMaintenanceFee  } = token.useContainer();
  // console.log(info)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState<string[]>([])
  const [nodeType, setNodeType] = useState(0)
  const [upgradeEnalbled, setUpgradeEnabled] = useState(false)
  const nodePrice = [10, 20, 50, 100]
  const checkedIcon = <svg className="h-8 w-8 text-red-500"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>


const handlePayForAMonth = (e:any) => {
  let tr = e.target.closest("tr")
  const nodeIndex = tr.dataset.key
  setLoading(true)
  try {
    payMaintenanceFee(nodeIndex).then(async () => {
      toast.success(`Successfully Set`)
      await multicall()
      setLoading(false)
    }).catch(ex => {
      toast.error(parseError(ex))
      setLoading(false)
    })
  } catch (ex) {
    toast.error(parseError(ex))
    setLoading(false)
  }
}

const handleApproveUSDC = () => {
  setLoading(true)
  try {
    approveUSDC().then(async () => {
      toast.success(`Successfully Approved`)
      await multicall()
      setLoading(false)
    }).catch(ex => {
      toast.error(parseError(ex))
      setLoading(false)
    })
  } catch (ex) {
    toast.error(parseError(ex))
    setLoading(false)
  }
}
  // Local button loading
  const parseError = (ex: any) => {
    if (typeof ex == 'object')
      return (ex.data?.message ?? null) ? ex.data.message.replace('execution reverted: ', '') : ex.message
    return ex
  }
  const getDate = (timestamp:number) =>{
    const d = new Date( timestamp * 1000);
    return d.toDateString();
  }
  console.log(info.totalNodes)
  return(
  <div className="flex flex-col md:mx-[197px] mx-[10%] mt-[30px] md:mt-4">
    <div className="md:mt-[32px] shadow-xl">
        <div className="w-full overflow-x-auto md:overflow-x-hidden h-full min-h-[500px]">
            <table className="mx-auto w-full whitespace-nowrap rounded-lg bg-gray-100 dark:bg-gray-900">
                <thead className="sticky bg-gray-100 dark:bg-gray-900 t-0">
                  <tr className="text-gray-900 dark:text-gray-100 text-left bg-[#00C6ED] ">
                      <th colSpan={7} className="p-[16px]">My Nodes</th>
                  </tr>
                  
                  <tr className="text-[16px] bg-gray-100 dark:bg-gray-900">
                      <th className="pt-[12px] pl-[16px] text-left"><span className="text-[#00c6ed]">Node Type</span></th>
                      <th className="pt-[12px] pl-[16px] text-left"><span className="text-[#00c6ed]">Status</span></th>
                      {/* <th className="pt-[12px] pl-[16px] text-left"><span className="text-[#00c6ed]">Lend</span></th> */}
                      <th className="pt-[12px] pl-[16px] text-left"><span className="text-[#00c6ed]">Rent Deadline</span></th>
                      <th className="pt-[12px] pl-[16px] text-left"><span className="text-[#00c6ed]">Dead Line</span></th>
                      <th className="pt-[12px] pl-[16px] text-left"><span className="text-[#00c6ed]"> Pay</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y-[1px] px-[16px] border border-2  text-gray-900 dark:text-gray-100">
                  {
                    info.totalNodes?.length>0 &&
                    info.totalNodes.map((node:any) => 
                        <tr key={node.nodeIndex.toString()} data-key={node.nodeIndex.toString()} className="border text-left text-[16px] ">
                          <td className="py-[12px] pl-[20px]">{node.nodeType==0?"Nano":node.nodeType==1?"Pico":node.nodeType==2?"Mega":"Giga"} Node</td>
                          <td className="py-[12px] pl-[20px]">{node.borrowStatus == false && node.lendStatus ==false ? "Owned": node.lendStatus == true ? "Lend": "Rented" }</td>
                          <td className="py-[12px] pl-[20px]">{node.borrowStatus == true || node.lendStatus == true? getDate(Number(formatNumber(node.rentDeadline))): "" }</td>
                          {/* <td className="py-[12px] pl-[20px]">{node.borrowStatus == true ? checkedIcon: "" }</td> */}
                          <td className="py-[12px] pl-[20px]">{getDate(Number(formatNumber(node.deadline)))}</td>
                          <td>
                            {info.approvedUSDC?
                              <button disabled={node.lendStatus == true} 
                                className={classNames((node.lendStatus == true)?"text-gray-900 dark:text-gray-100 bg-[#d1d5db] dark:bg-[#4e4e4e]":"text-gray-900 dark:text-gray-100 hover:bg-[#00C6ED] dark:bg-[#00C6ED]","text-center font-normal text-[16px] border-solid border-[#00C6ED] border-[1px] rounded-[14px] px-4 py-2")} 
                                onClick={handlePayForAMonth}>
                                Pay
                              </button>:
                              <button disabled={node.lendStatus == true} 
                                className={classNames((node.lendStatus == true)?"text-gray-900 dark:text-gray-100 bg-[#d1d5db] dark:bg-[#4e4e4e]":"text-gray-900 dark:text-gray-100 hover:bg-[#00C6ED] dark:bg-[#00C6ED]","text-center font-normal text-[16px] border-solid border-[#00C6ED] border-[1px] rounded-[14px] px-4 py-2")} 
                                onClick={handleApproveUSDC}>
                                Approve
                              </button>
                            }
                          </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  </div>
  )
}