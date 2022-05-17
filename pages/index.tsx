import { eth } from "state/eth"; // State container
import { useState } from "react"; // State management
// import Chart from 'react-apexcharts'
import { token } from "state/token"; // Global state: Tokens
import classNames from "classnames"
import { BigNumber } from "@ethersproject/bignumber"
import {formatNumber} from "utils/formatBalance";
import { toast } from "react-toastify"
// import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils"
import dynamic from 'next/dynamic'

const Chart  = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
)

export default function Home() {
  // Authentication status
  const { address }: { address: string | null } = eth.useContainer();
  const {info, claimRewards, payAllMaintenanceFee,approveUSDC,multicall} = token.useContainer();
  const [loading, setLoading] = useState(false)
  
  const totalSupply = info.totalSupply? info.totalSupply : BigNumber.from(0)
  const priceHONE = info.priceHONE? info.priceHONE : BigNumber.from(0)
  // const marketCap = totalSupply*priceHONE/1e18
  const marketCap = 0 // temporary
  info.priceHONE = 0  // temporary

  let nanoNodesOwned = [], nanoNodesRent = [], picoNodesOwned = [], picoNodesRent = [], megaNodesOwned = [], megaNodesRent=[], gigaNodesOwned=[],gigaNodesRent=[]
  if(info.totalNodes){
    nanoNodesOwned = info.totalNodes?.filter((node:any) => node.nodeType == 0 && node.lendStatus == false && node.borrowStatus == false);
    nanoNodesRent = info.totalNodes?.filter((node:any) => node.nodeType == 0 && node.borrowStatus == true);
    picoNodesOwned = info.totalNodes?.filter((node:any) => node.nodeType == 1 && node.lendStatus == false && node.borrowStatus == false);
    picoNodesRent = info.totalNodes?.filter((node:any) => node.nodeType == 1 && node.borrowStatus == true);
    megaNodesOwned = info.totalNodes?.filter((node:any) => node.nodeType == 2 && node.lendStatus == false && node.borrowStatus == false);
    megaNodesRent = info.totalNodes?.filter((node:any) => node.nodeType == 2 && node.borrowStatus == true);
    gigaNodesOwned = info.totalNodes?.filter((node:any) => node.nodeType == 3 && node.lendStatus == false && node.borrowStatus == false);
    gigaNodesRent = info.totalNodes?.filter((node:any) => node.nodeType == 3 && node.borrowStatus == true);
  }

  const totalNodes = info.totalNodes;
  let dailyRewards = 0
  totalNodes?.forEach((node:any) => {
    if(node.nodeType == 0)
      dailyRewards += 0.1
    if(node.nodeType == 1)
      dailyRewards += 0.23
    if(node.nodeType == 2)
      dailyRewards += 0.675
    if(node.nodeType == 3)
      dailyRewards += 1.75
  });

  let maintenanceFee = 0
  totalNodes?.filter((node:any)=>node.lendStatus==false).forEach((node:any) => {
    if(node.nodeType == 0)
      maintenanceFee += 10
    if(node.nodeType == 1)
      maintenanceFee += 20
    if(node.nodeType == 2)
      maintenanceFee += 30
    if(node.nodeType == 3)
      maintenanceFee += 45
  })
  const claim = () => {
    if(info.claimableAmount?.toString()){
      setLoading(true)
    try {
      claimRewards().then(async () => {
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
  const handlePayAll = (e:any) => {
    setLoading(true)
    try {
      payAllMaintenanceFee().then(async () => {
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
  const parseError = (ex: any) => {
    if (typeof ex == 'object')
      return (ex.data?.message ?? null) ? ex.data.message.replace('execution reverted: ', '') : ex.message
    return ex
  }
  const Nodestatus = [
    {
      name: "Nano",
      owned: nanoNodesOwned.length,
      rent: nanoNodesRent.length
    },
    {
      name: "Pico",
      owned: picoNodesOwned.length,
      rent: picoNodesRent.length
    },
    {
      name: "Mega",
      owned: megaNodesOwned.length,
      rent: megaNodesRent.length
    },
    {
      name: "Giga",
      owned: gigaNodesOwned.length,
      rent: gigaNodesRent.length
    },
  
  ];
  const options = {
    chart: {
      zoom: {
        enabled: false
      },
      parentHeightOffset: 0,
      toolbar: {
        show: false
      }
    },
  
    markers: {
      strokeWidth: 7,
      strokeOpacity: 1,
      strokeColors: ['#fff'],
      colors: ["#00875A"]
    },
    dataLabels: {
      enabled: false
    },
    // stroke: {
    //   curve: 'smooth'
    // },
    colors: ["#00875A", "#EB5757"],
   
    title: {
        text: 'Chart',
        // align: 'left',
        style: {
            fontSize:  '18px',
            fontFamily:  undefined,
            color:  '#18477B'
        }
      },
  
    xaxis: {
        // type: 'datetime',
        labels: {
            format: 'MMM-dd',
            style: {
                fontSize:  '10px',
                fontFamily:  "Poppins",
                colors:  '#276385',
                fontWeight: 400,
                cssClass: 'apexcharts-xaxis-label'
            }
        }
          
    },
    yaxis: {
      tickAmount:6,
  
      labels: {
        formatter(value:any) {
          return `${value}%`
        }
      }
    },
    legend: {
        // position: 'top',
        // horizontalAlign: 'right',
        floating: true,
        offsetY: -35,
        offsetX: -5,
        markers: {
            width: 12,
            height: 5,
            strokeWidth: 0,
            strokeColor: '#fff',
            radius: 1,
            offsetX: 0,
            offsetY: -3
        }
      }
  }
  // ** Chart Series
const series = [
  {
    name: "Price",
    data: [
      { x: '01/06/2020', y: 3.5 },
      { x: '01/07/2020', y: 3.7 },
      { x: '01/08/2020', y: 3.5 },
      { x: '01/09/2020', y: 3.7 },
      { x: '01/10/2020', y: 3.5 },
      { x: '01/11/2020', y: 3.7 },
      { x: '01/12/2020', y: 3.5 },
      { x: '01/13/2020', y: 3.7 },
      { x: '01/14/2020', y: 3.5 },
      { x: '01/15/2020', y: 3.7 },
      { x: '01/16/2020', y: 3.5 },
      { x: '01/17/2020', y: 3.7 },
      { x: '01/18/2020', y: 3.5 },
      { x: '01/19/2020', y: 3.7 },
      { x: '01/20/2020', y: 3.5 },
      { x: '01/21/2020', y: 3.7 }
  ]
  },
  {
    name: "MarketCap",
    data: [
      { x: '01/06/2020', y: 2.5 },
      { x: '01/07/2020', y: 2.7 },
      { x: '01/08/2020', y: 3.5 },
      { x: '01/09/2020', y: 3.7 },
      { x: '01/10/2020', y: 2.5 },
      { x: '01/11/2020', y: 1.7 },
      { x: '01/12/2020', y: 4.5 },
      { x: '01/13/2020', y: 4.7 },
      { x: '01/14/2020', y: 5.5 },
      { x: '01/15/2020', y: 5.7 },
      { x: '01/16/2020', y: 6.5 },
      { x: '01/17/2020', y: 6.7 },
      { x: '01/18/2020', y: 7.5 },
      { x: '01/19/2020', y: 7.7 },
      { x: '01/20/2020', y: 6.5 },
      { x: '01/21/2020', y: 5.7 }
  ]
  }
]
  return (
    <div className={classNames(loading?"loading":"","flex flex-col mx-[10%] md:mx-[64px] mt-[30px]")}>
      <div className="max-w-full flex flex-col mb-8">
        <h2 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-gray-100 mb-5">
          My Nodes 🗻️
        </h2>
        <div className = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 items-center">
          <div className = "inline-flex items-center flex-col relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-900 dark:text-gray-100 dark:text-white">
              <thead>
                <tr className = "bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <th className=" px-2">Tier</th>
                  <th className=" px-2">Owned</th>
                  <th className=" px-2">Rent</th>
                </tr>
              </thead>
              <tbody>
              {Nodestatus.map((node) => (
                <tr key={node.name} className = "bg-white border-b dark:bg-black dark:border-gray-700">
                  <td className=" px-2">{node.name}</td>
                  <td className=" px-2">{node.owned}</td>
                  <td className=" px-2">{node.rent}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 rounded-[12px] border-none h-[116px] mb-[30px] md:mb-[0px] shadow-xl">
            <div className="p-4 text-[14px] text-[#8a8c8f]">
                <div className="flex">
                  <img src="/icons/balance_icon.svg" alt="" className="mr-[5px]" /> 
                  <span className="text-[14px] text-gray-900 dark:text-gray-100">My $HONE Balance</span></div>
            </div>
            <div className="v-card__text pl-[32px]">
                <div className="flex font-medium text-gray-900 dark:text-gray-100 mr-[16px]">
                  <div className="font-medium text-xl text-gray-900 dark:text-gray-100 mr-[16px]">
                      {info.balanceOfHone?formatNumber(info.balanceOfHone/1e18,0,3):0} HONE
                  </div>
                </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 rounded-[12px] border-none h-[116px] mb-[30px] md:mb-[0px] shadow-xl">
            <div className="p-4 text-[14px] text-[#8a8c8f]">
                <div className="flex">
                  <img src="/icons/balance_icon.svg" alt="" className="mr-[5px]" /> 
                  <span className="text-[14px] text-gray-900 dark:text-gray-100">My $GHONE Balance</span></div>
            </div>
            <div className="v-card__text pl-[32px]">
                <div className="flex font-medium text-gray-900 dark:text-gray-100 mr-[16px]">
                  <div className="font-medium text-xl text-gray-900 dark:text-gray-100 mr-[16px]">
                      {info.balanceOfGHone?formatNumber(info.balanceOfGHone/1e18,0,3):0} GHONE
                  </div>
                </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 rounded-[12px] border-none h-[116px] mb-[30px] md:mb-[0px] shadow-xl">
            <div className="p-4 text-[14px] text-[#8a8c8f]">
                <div className="flex">
                  <img src="/icons/dailyrewards_icon.svg" alt="" className="mr-[5px]" /> 
                  <span className="text-[14px] text-gray-900 dark:text-gray-100">Daily Rewards</span></div>
            </div>
            <div className="v-card__text pl-[32px]">
                <div className="flex font-medium text-2xl text-gray-900 dark:text-gray-100 mr-[16px]">
                  <div className="font-medium text-xl text-gray-900 dark:text-gray-100 mr-[16px]">
                      {Number(dailyRewards).toFixed(2)} HONE
                  </div>
                </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 rounded-[12px] border-none h-[116px] mb-[30px] md:mb-[0px] shadow-xl">
            <div className="p-4 text-[14px] text-[#8a8c8f]">
                <div className="flex">
                  <img src="/icons/pendingrewards_icon.svg" alt="" className="mr-[5px]" /> 
                  <span className="text-[14px] text-gray-900 dark:text-gray-100">Pending Rewards</span></div>
            </div>
            <div className="v-card__text pl-[32px]">
                <div className="flex font-medium text-2xl text-gray-900 dark:text-gray-100 mr-[16px]">
                  <div className="w-full">
                    <div className="flex flex-row justify-between items-center">
                      <div className="font-medium text-xl text-gray-900 dark:text-gray-100 mr-[16px] leading-4">
                        {info.claimableAmount?formatNumber(info.claimableAmount/1e18,0,2):0} HONE
                      </div>
                      <button onClick={claim} className="text-gray-900 dark:text-gray-100 dark:bg-[#00C6ED] hover:bg-[#00C6ED] text-center font-normal text-[16px] border-solid border-[#00C6ED] border-[1px] rounded-[14px] px-2 py-1 mr-2 float-right" >
                        Claim
                      </button>
                    </div>
                  </div>
                </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 rounded-[12px] border-none h-[116px] mb-[30px] md:mb-[0px] shadow-xl">
            <div className="p-4 text-[14px] text-[#8a8c8f]">
                <div className="flex">
                  <img src="/icons/pendingrewards_icon.svg" alt="" className="mr-[5px]" /> 
                  <span className="text-[14px] text-gray-900 dark:text-gray-100">Maintence Fees</span>
                </div>
            </div>
            <div className="v-card__text pl-[32px]">
                <div className="flex font-medium text-2xl text-gray-900 dark:text-gray-100 mr-[16px]">
                  <div className="w-full">
                      
                      <div className="flex flex-row justify-between items-center">
                        <div className="font-medium text-xl text-gray-900 dark:text-gray-100 mr-[16px] leading-4">
                          {maintenanceFee} USDC
                        </div>
                        {info.approvedUSDC?
                          <button onClick={handlePayAll} className="text-gray-900 dark:text-gray-100 dark:bg-[#00C6ED] hover:bg-[#00C6ED] text-center font-normal text-[16px] border-solid border-[#00C6ED] border-[1px] rounded-[14px] px-4 py-1 mr-2 float-right" >
                            Pay
                          </button>:
                          <button onClick={handleApproveUSDC} className="text-gray-900 dark:text-gray-100 dark:bg-[#00C6ED] hover:bg-[#00C6ED] text-center font-normal text-[16px] border-solid border-[#00C6ED] border-[1px] rounded-[14px] px-4 py-1 mr-2 float-right" >
                            Approve
                          </button>
                        }
                        
                      </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      <span className="mt-10 font-medium text-2xl text-gray-900 dark:text-gray-100 ml-[3px]">Protocol Stats ❄️</span> 
      <div className = "mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 gap-4 items-center">
        <div className = "grid grid-cols-2 gap-5">
          <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 rounded-[12px] border-none h-[116px] mb-[30px] md:mb-[0px] shadow-xl">
            <div className="p-4 text-[14px]">
                <div className="flex">
                  <img src="/icons/price_icon.svg" alt="" className="mr-[5px]" /> 
                  <span className="text-[14px] text-gray-900 dark:text-gray-100">$HONE Price</span>
                </div>
            </div>
            <div className="pl-[32px]">
                <div className="flex font-medium text-2xl text-gray-900 dark:text-gray-100 mr-[16px]">
                  <div className="font-medium text-2xl text-gray-900 dark:text-gray-100 mr-[16px]">$ {info.priceHONE?Number(formatEther(info.priceHONE)).toFixed(2):0}</div>
                </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 rounded-[12px] border-none h-[116px] mb-[30px] md:mb-[0px] shadow-xl">
            <div className="p-4 text-[14px] text-[#8a8c8f]">
                <div className="flex">
                  <img src="/icons/marketcap_icon.svg" alt="" className="mr-[5px]" /> 
                  <span className="text-[14px] text-gray-900 dark:text-gray-100">Market Cap</span>
                </div>
            </div>
            <div className="pl-[32px]">
                <div className="flex justify-center font-medium text-2xl text-gray-900 dark:text-gray-100 mr-[16px]">
                  <div className="font-medium text-2xl text-gray-900 dark:text-gray-100 mr-[16px]">
                      ${formatNumber(marketCap/1e18,0,0)}
                  </div>
                </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 rounded-[12px] border-none h-[116px] mb-[30px] md:mb-[0px] shadow-xl">
            <div className="p-4 text-[14px] text-[#8a8c8f]">
                <div className="flex">
                  <img src="/icons/circsupply_icon.svg" alt="" className="mr-[5px]" /> 
                  <span className="text-[14px] text-gray-900 dark:text-gray-100">Total Supply</span>
                </div>
            </div>
            <div className="pl-[32px]">
                <div className="flex justify-center font-medium text-2xl text-gray-900 dark:text-gray-100 mr-[16px]">
                  <div className="font-medium text-2xl text-gray-900 dark:text-gray-100 mr-[16px]">
                      {formatNumber(totalSupply/1e18,0,0)}
                  </div>
                </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 rounded-[12px] border-none h-[116px] mb-[30px] md:mb-[0px] shadow-xl">
            <div className="p-4 text-[14px] text-[#8a8c8f]">
                <div className="flex">
                  <img src="/icons/totalnode_icon.svg" alt="" className="mr-[5px]" /> 
                  <span className="text-[14px] text-gray-900 dark:text-gray-100">Total Nodes</span></div>
            </div>
            <div className="pl-[32px]">
                <div className="flex justify-center font-medium text-2xl text-gray-900 dark:text-gray-100 mr-[16px]">
                  <div className="font-medium text-2xl text-gray-900 dark:text-gray-100 mr-[16px]">
                      {info.countTotal?formatNumber(info.countTotal,0,0):0}
                  </div>
                </div>
            </div>
          </div> 
          <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 rounded-[12px] border-none h-[116px] mb-[30px] md:mb-[0px] shadow-xl">
            <div className="p-4 text-[14px] text-[#8a8c8f]">
                <div className="flex">
                  <img src="/icons/totalnode_icon.svg" alt="" className="mr-[5px]" /> 
                  <span className="text-[14px] text-gray-900 dark:text-gray-100">Total Holders</span></div>
            </div>
            <div className="pl-[32px]">
                <div className="flex justify-center font-medium text-2xl text-gray-900 dark:text-gray-100 mr-[16px]">
                  <div className="font-medium text-2xl text-gray-900 dark:text-gray-100 mr-[16px]">
                      100000
                  </div>
                </div>
            </div>
          </div> 
          <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 rounded-[12px] border-none h-[116px] mb-[30px] md:mb-[0px] shadow-xl">
            <div className="p-4 text-[14px] text-[#8a8c8f]">
                <div className="flex">
                  <img src="/icons/totalnode_icon.svg" alt="" className="mr-[5px]" /> 
                  <span className="text-[14px] text-gray-900 dark:text-gray-100">24Hr Changes</span></div>
            </div>
            <div className="pl-[32px]">
                <div className="flex justify-center font-medium text-2xl text-gray-900 dark:text-gray-100 mr-[16px]">
                  <div className="font-medium text-2xl text-gray-900 dark:text-gray-100 mr-[16px]">
                      0
                  </div>
                </div>
            </div>
          </div> 
        </div>
        <div className = "grid grid-cols-2 gap-5 overflow-hidden">
         {/*<Chart options={options} series={series} type='line' height={400} width = {600} /> */} 
        </div>
      </div>
      
      
    </div>
  );
}
