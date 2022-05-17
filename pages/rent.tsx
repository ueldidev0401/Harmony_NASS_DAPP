import { eth } from "state/eth"; // Global state: ETH
import { useEffect, useState } from "react"; // State management
import { token } from "state/token"; // Global state: Tokens
import { toast } from "react-toastify"
import classNames from "classnames"
import { formatEther, parseEther } from "ethers/lib/utils"
import {formatNumber} from "utils/formatBalance";
export default function Merge() {
  // Global ETH state
  const { address, unlock }: { address: string | null; unlock: Function } =
    eth.useContainer();
  // Global token state
  const { info, listLendOffer,closeLendOffer, acceptLendOffer,approveUSDC, approve, approveToOwner, multicall, payMaintenanceFee } = token.useContainer();
  // Local button loading
  const totalNodes = info.totalNodes?.length>0 && info.totalNodes.filter((node:any)=>node.borrowStatus == false)
  const lendOffers = info.lendOffers
  let isMobile = false;
  if (typeof window !== 'undefined') {
    isMobile = (window.innerWidth <= 600);
  }
  let myNodes:any = []
    if(totalNodes.length > 0){
      totalNodes.filter((node:any)=>node.lendStatus==false).forEach((node:any) => {
        let param = 0
        lendOffers.length > 0 &&
        lendOffers.forEach((itme:any) => {
          if(node.nodeIndex.toString() === itme.nodeIndex.toString()){
            myNodes.push(itme)
            param ++
            return
          }
        }) 
        if(param==0)
        myNodes.push(node)
      });
    }

  const [loading, setLoading] = useState(false)
  
  const handleSetLendOffer = (e:any) => {
    let tr = e.target.closest("tr")
    const months = tr.childNodes[1].firstElementChild.value
    const price = tr.childNodes[2].firstElementChild.value
    const priceAmount = parseEther(price)
    const nodeIndex = tr.dataset.key
    if(months <= 0 || price <= 0){
      toast.warning(`Please set right data!`)
      return 
    }
    setLoading(true)
    try {
      listLendOffer(nodeIndex, priceAmount, months).then(async () => {
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

  const handleRemoveLendOffer = (e:any) => {
    let tr = e.target.closest("tr")
    const nodeIndex = tr.dataset.key
    let offerIndex = 0;
    lendOffers.forEach((itme:any) => {
      if(nodeIndex.toString() === itme.nodeIndex.toString()){
        offerIndex = itme.offerIndex;
      }
    }) 

    setLoading(true)
    try {
      closeLendOffer(offerIndex).then(async () => {
        toast.success(`Successfully Removed`)
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
  const handleApprove = () => {
    setLoading(true)
    approve().then(async () => {
      toast.success(`Successfully Borrowed`)
      await multicall()
      setLoading(false)
    }).catch(ex => {
      toast.error(parseError(ex))
      setLoading(false)
    })
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
  const handleAccepLendOffer = (e:any) => {
    let tr = e.target.closest("tr")
    const offerIndex = tr.dataset.key
    const price = tr.dataset.amount
    const owner = tr.dataset.owner
    setLoading(true)
    try {
      // approve().then(async () => {
        approveToOwner(String(owner), parseEther(price)).then(async () => {
          acceptLendOffer(offerIndex).then(async () => {
            toast.success(`Successfully Borrowed`)
            await multicall()
            setLoading(false)
          }).catch(ex => {
            toast.error(parseError(ex))
            setLoading(false)
          })
        }).catch(ex => {
          toast.error(parseError(ex))
          setLoading(false)
        })
      // }).catch(ex => {
      //   toast.error(parseError(ex))
      //   setLoading(false)
      // })
      
      
    } catch (ex) {
      toast.error(parseError(ex))
      setLoading(false)
    }
  }
  const parseError = (ex: any) => {
    if (typeof ex == 'object')
      return (ex.data?.message ?? null) ? ex.data.message.replace('execution reverted: ', '') : ex.message
    return ex
  }
  const getDate = (timestamp:number) =>{
    const d = new Date( timestamp * 1000);
    return d.toDateString();
  }
 // {node.borrowStatus == false && node.lendStatus ==false ? "Owned": node.lendStatus == true ? "Lend": "Rented" }
  const renderStatus = (offer:any, borrow:any, lend:any) => {
    console.log("myNode", myNodes)
    if (offer == true){
      return "Listed";
    }
    else if (borrow == true){
      return "Rent";
    }
    else if (lend == true){
      return "Lend";
    }
    else{
      return "Owned";
    }

  }
  return (
    <div className={classNames(loading?"loading":"")}>
      <div className="flex flex-col md:mx-[197px] mx-[10%] mt-[30px] md:mt-4">
        <span className="text-[24px] text-gray-900 dark:text-gray-100">Node Rent</span> 
        <div className="mt-[32px]">
          <div className="md:mt-[32px] shadow-xl">
              <div className="overflow-x-auto w-full">
                <table className="mx-auto w-full whitespace-nowrap rounded-lg bg-gray-100 dark:bg-gray-900  overflow-hidden">
                    <thead>
                      <tr className="text-gray-900 dark:text-gray-100 text-left bg-[#00C6ED]">
                          <th className="p-[16px]">Active Listing</th>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th></th>
                      </tr>
                      <tr className="bg-gray-100 dark:bg-gray-900">
                          <th className="pt-[12px] pl-[16px] text-left text-[12px]"><span className="text-[#00c6ed]">Node Type</span></th>
                          <th className="pt-[12px] pl-[16px] text-left text-[12px]"><span className="text-[#00c6ed]">Owner</span></th>
                          <th className="pt-[12px] pl-[16px] text-left text-[12px]"><span className="text-[#00c6ed]">Month</span></th>
                          <th className="pt-[12px] pl-[16px] text-left text-[12px]"><span className="text-[#00c6ed]">Price Amount</span></th>
                          <th className="pt-[12px] pl-[16px] text-left text-[12px]"><span className="text-[#00c6ed]">Action</span></th>
                      </tr>
                    </thead>
                    <tbody className=" border-2 divide-y-[1px] px-[16px] text-gray-900 dark:text-gray-100 dark:border-gray-700">
                      {info.lendOffersAll?.length > 0 ?
                      info.lendOffersAll.map((node:any)=>
                      <tr key={node.offerIndex} data-key={node.offerIndex} data-amount={formatEther(node.amount)} data-owner={node.owner} className=" dark:border-gray-700">                      
                        <td className="py-[12px] pl-[20px]">{node.nodeType==0?"Nano":node.nodeType==1?"Pico":node.nodeType==2?"Mega":"Giga"} Node</td>
                        <td className="py-[12px] pl-[20px]">{isMobile?`${node.owner.substring(0, 4)}..${node.owner.slice(-3)}`:`${node.owner.substring(0, 10)}...${node.owner.slice(-8)}`}</td>
                        <td className="py-[12px] pl-[20px]">{node.months}</td>
                        <td className="py-[12px] pl-[20px]">{formatEther(node.amount)}</td>
                        <td className="py-[12px] pl-[20px]">
                          {info.approvedHone?
                          <button onClick={handleAccepLendOffer} className="text-gray-900 dark:text-gray-100 dark:bg-[#00C6ED] hover:bg-[#00C6ED] text-center font-normal text-[16px] border-solid border-[#00C6ED] border-[1px] rounded-[14px] px-4 py-2"> 
                            Accept
                          </button>
                          :
                          <button onClick={handleApprove} className="text-gray-900 dark:text-gray-100 dark:bg-[#00C6ED] hover:bg-[#00C6ED] text-center font-normal text-[16px] border-solid border-[#00C6ED] border-[1px] rounded-[14px] px-4 py-2"> 
                            Approve
                          </button>
                          }
                        </td>
                      </tr>
                      ):
                      <tr>
                        <td colSpan={5} className="text-center">
                          There is no listed data
                        </td>
                      </tr>
                    }
                    </tbody>
                </table>
              </div>
          </div>
        </div>
        <div className="mt-[32px] overflow-x-auto md:overflow-x-hidden w-full">
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
                  <th className="pt-[12px] pl-[16px] text-left"><span className="text-[#00c6ed]">MT Fee Deadline</span></th>
                  <th className="pt-[12px] pl-[16px] text-left"><span className="text-[#00c6ed]"> Pay</span></th>
                  <th className="pt-[12px] pl-[16px] text-left"><span className="text-[#00c6ed]"> Action</span></th>
              </tr>
            </thead>
            <tbody className="divide-y-[1px] px-[16px] border border-2  text-gray-900 dark:text-gray-100">
              {
                info.totalNodes?.length>0 &&
                info.totalNodes.map((node:any) => 
                    <tr key={node.nodeIndex.toString()} data-key={node.nodeIndex.toString()} className="border text-left text-[16px] ">
                      <td className="py-[12px] pl-[20px]">{node.nodeType==0?"Nano":node.nodeType==1?"Pico":node.nodeType==2?"Mega":"Giga"} Node</td>
                      <td className="py-[12px] pl-[20px]">
                        {renderStatus(node.offerStatus, node.borrowStatus, node.lendStatus)}
                      </td>
                      <td className="py-[12px] pl-[20px]">{node.borrowStatus == true || node.lendStatus == true? getDate(Number(formatNumber(node.rentDeadline))): "" }</td>
                      {/* <td className="py-[12px] pl-[20px]">{node.borrowStatus == true ? checkedIcon: "" }</td> */}
                      <td className="py-[12px] pl-[20px]">{getDate(Number(formatNumber(node.deadline)))}</td>
                      <td>
                        {info.approvedUSDC?
                        node.lendStatus == false?
                          <button 
                            className={classNames((node.lendStatus == true)?"text-gray-900 dark:text-gray-100 bg-[#d1d5db] dark:bg-[#4e4e4e]":"text-gray-900 dark:text-gray-100 hover:bg-[#00C6ED] dark:bg-[#00C6ED]","text-center font-normal text-[16px] border-solid border-[#00C6ED] border-[1px] rounded-[14px] px-4 py-2")} 
                            onClick={handlePayForAMonth}>
                            Pay MT Fee
                          </button>:<div></div>
                          :<button disabled={node.lendStatus == true} 
                            className={classNames((node.lendStatus == true)?"text-gray-900 dark:text-gray-100 bg-[#d1d5db] dark:bg-[#4e4e4e]":"text-gray-900 dark:text-gray-100 hover:bg-[#00C6ED] dark:bg-[#00C6ED]","text-center font-normal text-[16px] border-solid border-[#00C6ED] border-[1px] rounded-[14px] px-4 py-2")} 
                            onClick={handleApproveUSDC}>
                            Approve
                          </button>
                        }
                      </td>
                      <td>
                        {
                        node.offerStatus == true?
                          <button 
                            className={"text-center font-normal text-[16px] border-solid border-[#00C6ED] border-[1px] rounded-[14px] px-4 py-2"} 
                            onClick={handleRemoveLendOffer}
                            >
                            Remove Listing
                          </button>:<div></div>
                        }
                      </td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>
        <div className="mt-[32px] overflow-x-auto md:overflow-x-hidden w-full">
          <table className="mx-auto w-full whitespace-nowrap rounded-lg bg-gray-100 dark:bg-gray-900 ">
            <thead className="sticky, bg-gray-100 dark:bg-gray-900, t-0">
              <tr className="text-gray-900 dark:text-gray-100 text-left bg-[#00C6ED] ">
                  <th colSpan={6} className="p-[16px]">Create Listing</th>
              </tr>
              <tr className="text-[16px] bg-gray-100 dark:bg-gray-900">
                  <th className="pt-[12px] pl-[16px] text-left"><span className="text-[#00c6ed]">Node Type</span></th>
                  <th className="pt-[12px] pl-[16px] text-left"><span className="text-[#00c6ed]">Duration (Months)</span></th>
                  <th className="pt-[12px] pl-[16px] text-left"><span className="text-[#00c6ed]">Price for Lend</span></th>
                  <th className="pt-[12px] pl-[16px] text-left"><span className="text-[#00c6ed]">Action</span></th>
              </tr>
            </thead>
            <tbody className="divide-y-[1px] px-[16px] border border-2 text-gray-900 dark:text-gray-100  dark:border-gray-700">
            {
              
                myNodes.length>0?
                  myNodes.map((node:any) => 
                  node.offerIndex?
                    "":
                    <tr key={node.nodeIndex.toString()} data-key={node.nodeIndex.toString()} className="border text-left text-[16px] ">
                      <td className="py-[12px] pl-[20px]">{node.nodeType==0?"Nano":node.nodeType==1?"Pico":node.nodeType==2?"Mega":"Giga"} Node</td>
                      <td className="py-[12px] pl-[20px]"><input type="text" min="1" className="p-2 border-2 rounded w-[100px] md:w-full bg-gray-100 dark:bg-gray-900 outline-gray-100 dark:outline-gray-900" defaultValue="" /></td>
                      <td className="py-[12px] pl-[20px]"><input type="text" className="p-2 border-2 rounded w-[100px] md:w-full bg-gray-100 dark:bg-gray-900" defaultValue="" /></td>
                      <td className="py-[12px] pl-[20px]">
                        <button onClick={handleSetLendOffer} className="text-gray-900 dark:text-gray-100 dark:bg-[#00C6ED] hover:bg-[#00C6ED] text-center font-normal text-[16px] border-solid border-[#00C6ED] border-[1px] rounded-[14px] px-4 py-2"> 
                          List Node
                        </button>
                      </td>
                    </tr>
                  ):
                  <tr>
                    <td colSpan={5} className="text-center">
                      There is no listed data
                    </td>
                  </tr>
              }
              {
              /*  myNodes.length>0?
                  myNodes.map((node:any) => 
                  node.offerIndex?
                    <tr key={node.nodeIndex.toString()} data-key={node.offerIndex.toString()} className="border text-left text-[16px] dark:border-gray-700">
                      <td className="py-[12px] pl-[20px]">{node.nodeType==0?"Nano":node.nodeType==1?"Pico":node.nodeType==2?"Mega":"Giga"} Node</td>
                      <td className="py-[12px] pl-[20px]"><input type="text" min="1" className="p-2 border-2 rounded w-[100px] md:w-full" defaultValue={node.months} disabled/></td>
                      <td className="py-[12px] pl-[20px]"><input type="text" className="p-2 border-2 rounded w-[100px] md:w-full" defaultValue={formatEther(node.amount)} disabled/></td>
                      <td className="py-[12px] pl-[20px]">
                        <button onClick={handleRemoveLendOffer} className="text-gray-900 dark:text-gray-100 bg-[#00C6ED] hover:bg-[#ffffff] text-center font-normal text-[16px] border-solid border-[#00C6ED] border-[1px] rounded-[14px] px-4 py-2"> 
                          Reject
                        </button>
                      </td>
                    </tr>:
                    <tr key={node.nodeIndex.toString()} data-key={node.nodeIndex.toString()} className="border text-left text-[16px] ">
                      <td className="py-[12px] pl-[20px]">{node.nodeType==0?"Nano":node.nodeType==1?"Pico":node.nodeType==2?"Mega":"Giga"} Node</td>
                      <td className="py-[12px] pl-[20px]"><input type="text" min="1" className="p-2 border-2 rounded w-[100px] md:w-full bg-gray-100 dark:bg-gray-900 outline-gray-100 dark:outline-gray-900" defaultValue="" /></td>
                      <td className="py-[12px] pl-[20px]"><input type="text" className="p-2 border-2 rounded w-[100px] md:w-full bg-gray-100 dark:bg-gray-900" defaultValue="" /></td>
                      <td className="py-[12px] pl-[20px]">
                        <button onClick={handleSetLendOffer} className="text-gray-900 dark:text-gray-100 dark:bg-[#00C6ED] hover:bg-[#00C6ED] text-center font-normal text-[16px] border-solid border-[#00C6ED] border-[1px] rounded-[14px] px-4 py-2"> 
                          Lend
                        </button>
                      </td>
                    </tr>
                  ):
                  <tr>
                    <td colSpan={5} className="text-center">
                      There is no listed data
                    </td>
                  </tr>*/
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
