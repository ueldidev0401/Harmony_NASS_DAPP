import { eth } from "state/eth"; // Global state: ETH
import { useState } from "react"; // State management
import { token } from "state/token"; // Global state: Tokens
import classNames from "classnames"
import { toast } from "react-toastify"
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils"
import {formatNumber} from "utils/formatBalance";

export default function Buynodes() {
  // Global ETH state
  const { address } = eth.useContainer();
  // Global token state
  const { info, approve,approveUSDC,approveNft, multicall, createNode, swapNode } = token.useContainer();
  console.log(info)
  // Local button loading
  const [loading, setLoading] = useState(false)
  const [nodeType, setNodeType] = useState<number>(-1)
  const [honeAmount, setHoneAmount] = useState<BigNumber>(BigNumber.from(0))
  const [usdcAmount, setUSDCAmount] = useState<BigNumber>(BigNumber.from(0))
  const [rewardPercent, setRewardPercent] = useState(0)
  const [deadLine, setDeadLine] = useState(0)
  const [swapType, setSwapType] = useState("hone")
  const parseError = (ex: any) => {
    if (typeof ex == 'object')
      return (ex.data?.message ?? null) ? ex.data.message.replace('execution reverted: ', '') : ex.message
    return ex
  }
  const handleSetNodeType = (e: any) => {
    setNodeType(e.target.value)
    switch (e.target.value) {
      case "-1": 
        setHoneAmount(parseEther("0"))
        setUSDCAmount(parseEther("0"))
        setRewardPercent(0)
        setDeadLine(0)
        break;
      case "0": 
        setHoneAmount(parseEther("10"))
        setUSDCAmount(parseEther("10"))
        setRewardPercent(100)
        setDeadLine(100)
        break;
      case "1": 
        setHoneAmount(parseEther("20"))
        setUSDCAmount(parseEther("20"))
        setRewardPercent(115)
        setDeadLine(87)
        break;
      case "2": 
        setHoneAmount(parseEther("50"))
        setUSDCAmount(parseEther("30"))
        setRewardPercent(135)
        setDeadLine(75)
        break;
      case "3": 
        setHoneAmount(parseEther("100"))
        setUSDCAmount(parseEther("45"))
        setRewardPercent(175)
        setDeadLine(58)
        break;
      default:
        setHoneAmount(parseEther("0"))
        setUSDCAmount(parseEther("0"))
        setRewardPercent(0)
        setDeadLine(0)
        break;
    }
  }

  const handleApproveHone = () =>{
    if(nodeType<0){
      toast.warning(`Please select node type!`)
      return
    }
    setLoading(true)
    try {
      approve().then(async () => {
          toast.success(`Successfully approved!`)
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

  const handleApproveUSDC = () =>{
    setLoading(true)
    try {
        approveUSDC().then(async ()=>{
          toast.success(`Successfully approved!`)
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

  const handleApproveNft = () => {
    approveNft().then(async () => {
      toast.success(`Successfully approved!`)
      await multicall()
      setLoading(false)
    }).catch(ex => {
      toast.error(parseError(ex))
      setLoading(false)
    })
  }

  const handleCreate = () => {
    if (nodeType<0) {
      toast.warning('Must Select Node type!')
      return
    }
    setLoading(true)
    try {
      createNode(honeAmount, nodeType).then(async () => {
        toast.success(`Successfully created 1 nodes!`)
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
  const handleSwap = () => {
    let Nfts = info.nfts
    if (Nfts?.length == 0) {
      toast.warning('Must have one NFT at least!')
      return
    }
    console.log(Nfts[0].toString())
    setLoading(true)
    try {
      swapNode(Nfts[0]).then(async () => {
        toast.success(`Successfully created 1 nodes!`)
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


  return (
    <div className={classNames(loading?"loading":"")}>
      <div className="flex flex-col mx-[10%] mt-[30px] md:mx-[64px] md:mt-4">
        <span className="text-[24px] text-gray-900 dark:text-gray-100">Node Station 🚉️</span> 
        <div className="mt-[32px] ">
            <div className="md:flex md:flex-wrap bg-gray-100 dark:bg-gray-900 rounded-[12px] min-h-[172px] border-solid border-[#00C6ED] border-[1px] divide-white/40 divide-x-[1px] py-[16px] shadow-xl">
              <div className="flex flex-col md:w-[40%] md:px-[50px] mb-4">
                  <span className="text-[20px] text-gray-900 dark:text-gray-100 mb-[20px] ml-4">Create A Node</span> 
                  
                  <label className="ml-10 text-gray-900 dark:text-gray-100"><input type="radio" name="swapType" checked={swapType=="hone"} onChange={()=>setSwapType("hone")}/> with HONE</label>
                  <label className="ml-10 text-gray-900 dark:text-gray-100"><input type="radio" name="swapType" checked={swapType=="nft"}  onChange={()=>setSwapType("nft")}/> with NFT</label>
                  {swapType=="hone" && 
                  <div>
                    <div className="flex align-baseline my-4">
                      <span className="w-[30%] text-[16px] text-[#00C6ED] mr-8 mt-[1px] text-right">Type:</span> 
                      <div className="w-[50%] mr-8">
                          <select onChange={handleSetNodeType} className="border-solid border-[#00C6ED] border-[1px] w-full p-1 rounded-[12px] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                            <option value="-1">Selcet Node Type</option>
                            <option value="0">nano</option>
                            <option value="1">pico</option>
                            <option value="2">mega</option>
                            <option value="3">giga</option>
                          </select>
                      </div>
                    </div>
                    <div className="flex justify-center md:pt-8">
                      {
                        !info.approvedHone?
                        <button onClick={handleApproveHone} className="w-full mx-8 rounded-[14px] h-[33px] mt-[16px] border-solid border-[#00C6ED] border-[1px] hover:bg-[#00C6ED] text-gray-900 dark:text-gray-100">
                          Approve HONE
                        </button>
                        :
                        !info.approvedUSDC?
                        <button onClick={handleApproveUSDC} className="w-full mx-8 rounded-[14px] h-[33px] mt-[16px] border-solid border-[#00C6ED] border-[1px] hover:bg-[#00C6ED] text-gray-900 dark:text-gray-100">
                          Approve USDC
                        </button>
                        :
                        <button onClick={handleCreate} className="w-full mx-8 rounded-[14px] h-[33px] mt-[16px] border-solid border-[#00C6ED] border-[1px] hover:bg-[#00C6ED] text-gray-900 dark:text-gray-100">
                          Buy Node
                        </button>
                      }
                    </div>
                  </div>
                  }
                  
                  {swapType == "nft" &&(
                    <div className="my-4">
                      <span className="text-[16px] text-[#00C6ED] mr-8 text-right ml-10 my-4">NFT count:  
                        
                      </span> 
                      <strong className="text-gray-900 dark:text-gray-100 ml-2">{info.nfts?.length}</strong>
                      <div className="flex justify-center md:pt-8">
                        {info.approvedNFT?
                        <button onClick={handleSwap} className="w-full mx-8 rounded-[14px] h-[33px] mt-[16px] border-solid border-[#00C6ED] border-[1px] hover:bg-[#00C6ED] text-gray-900 dark:text-gray-100">
                          Swap Node
                        </button>
                        :
                        <button onClick={handleApproveNft} className="w-full mx-8 rounded-[14px] h-[33px] mt-[16px] border-solid border-[#00C6ED] border-[1px] hover:bg-[#00C6ED] text-gray-900 dark:text-gray-100">
                          Approve NFT
                        </button>
                        }
                      </div>
                    </div>
                    )
                  }
                  
              </div>
              
              <div className="flex flex-col px-[16px] mt-[20px] md:mt-[0px] md:w-[60%]">
                  <span className="text-[16px] text-gray-900 dark:text-gray-100">Tokenomic Details</span> 
                  <div className="md:flex md:first-letter:mt-[10px] divide-white/40 md:divide-x-[1px] py-[16px]">
                    <div className="md:mt-34px pr-[10px]">
                        <div className="flex md:mt-[10px] md:pt-[10px]"><span className="text-[#00C6ED] text-[12px]">Cost</span> <span className="text-[#00C6ED] text-[12px] mx-[4px]">=</span> <span className="text-[12px] text-gray-900 dark:text-gray-100"> {formatEther(honeAmount)} $HONE / Node</span></div>
                        <div className="flex mt-[3px]"><span className="text-[#00C6ED] text-[12px]">Yield</span> <span className="text-[#00C6ED] text-[12px] mx-[4px]">=</span> <span className="text-[12px] text-gray-900 dark:text-gray-100">{Number(formatEther(honeAmount))*rewardPercent/10000} $HONE / Claim (a day)</span></div>
                        <div className="flex mt-[3px]"><span className="text-[#00C6ED] text-[12px]">ROI</span> <span className="text-[#00C6ED] text-[12px] mx-[4px]">=</span> <span className="text-[12px] text-gray-900 dark:text-gray-100">{deadLine} days</span></div>
                    </div>
                    <div className="flex flex-col md:pl-[10px]">
                        <span className="text-[#00C6ED] text-[12px] mt-[16px]">Distribution of $HONE:</span> 
                        <div className="flex ml-[17px] mt-[8px]"><span className="text-[12px] text-gray-900 dark:text-gray-100 mr-[6px]">→</span> <span className="text-[#00c6ed] text-[12px]">Rewards Pool = </span> <span className="text-[12px] text-gray-900 dark:text-gray-100 !ml-[4px]"> 65%</span></div>
                        <div className="flex ml-[17px]"><span className="text-[12px] text-gray-900 dark:text-gray-100 mr-[6px]">→</span> <span className="text-[#00c6ed] text-[12px]">Burn = </span> <span className="text-[12px] text-gray-900 dark:text-gray-100 !ml-[4px]"> 25%</span></div>
                        <div className="flex ml-[17px]">
                          <div className="text-[12px] text-gray-900 dark:text-gray-100 mr-[6px]">→</div>
                          <span className="text-[#00c6ed] text-[12px]">Liquidity Pool = </span> <span className="text-[12px] text-gray-900 dark:text-gray-100 !ml-[4px]"> 10%</span>
                        </div>
                    </div>
                  </div>
              </div>
              
            </div>
        </div>
        <div className="md:flex flex-wrap gap-2 md:gap-[24px] mt-[32px]">
            <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 rounded-[12px] border-none h-[116px] mb-[30px] md:mb-[0px] shadow-xl">
              <div className="p-4 text-[14px] text-[#8a8c8f]">
                  <div className="flex">
                    <img src="/icons/totalnode_icon.svg" alt="" className="mr-[5px]" /> 
                    <span className="text-[14px] text-gray-900 dark:text-gray-100">Pending Rewards</span></div>
              </div>
              <div className="v-card__text pl-[32px]">
                  <div className="flex text-[24px] text-gray-900 dark:text-gray-100 mr-[16px]">
                    <div>
                        <div className="text-[24px] text-gray-900 dark:text-gray-100 mr-[16px] leading-6">
                          {info.claimableAmount?formatNumber(info.claimableAmount/1e18,0,3):0} HONE
                        </div>
                        <span className="text-[12px] text-gray-900 dark:text-gray-100 leading-1">(including ROI tax)</span>
                    </div>
                  </div>
              </div>
            </div>
            <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 rounded-[12px] border-none h-[116px] mb-[30px] md:mb-[0px] shadow-xl">
              <div className="p-4 text-[14px] text-[#8a8c8f]">
                  <div className="flex">
                    <img src="/icons/mynode_icon.svg" alt="" className="mr-[5px]" /> 
                    <span className="text-[14px] text-gray-900 dark:text-gray-100">My Nodes</span></div>
              </div>
              <div className="v-card__text pl-[32px]">
                  <div className="flex justify-center text-[24px] text-gray-900 dark:text-gray-100 mr-[16px]">
                    <div className="text-[24px] text-gray-900 dark:text-gray-100 mr-[16px]">
                      {info.countTotal?formatNumber(info.countTotal,0,0):0}
                    </div>
                  </div>
              </div>
            </div>
            <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 rounded-[12px] border-none h-[116px] mb-[30px] md:mb-[0px] shadow-xl">
              <div className="p-4 text-[14px] text-[#8a8c8f]">
                  <div className="flex">
                    <img src="/icons/balance_icon.svg" alt="" className="mr-[5px]" /> 
                    <span className="text-[14px] text-gray-900 dark:text-gray-100">My $HONE Balance</span>
                  </div>
              </div>
              <div className="v-card__text pl-[32px]">
                  <div className="flex text-[24px] text-gray-900 dark:text-gray-100 mr-[16px]">
                    <div className="text-[24px] text-gray-900 dark:text-gray-100 mr-[16px]">
                    {info.balanceOfHone?formatNumber(info.balanceOfHone/1e18,0,3):0} HONE
                    </div>
                  </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
