import { eth } from "state/eth"; // Global state: ETH
import { useEffect, useState } from "react"; // State management
import { token } from "state/token"; // Global state: Tokens
import classNames from "classnames"
import { toast } from "react-toastify"
import {formatNumber} from "utils/formatBalance";

export default function Merge() {
  // Global ETH state
  const { address, unlock }: { address: string | null; unlock: Function } =
    eth.useContainer();
  // Global token state
  const { info, approve, multicall, upgradeNode } = token.useContainer();
  // console.log(info)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState<string[]>([])
  const [nodeType, setNodeType] = useState(0)
  
  let nanoNodesOwned:any = [], picoNodesOwned:any = [], megaNodesOwned:any = [],  gigaNodesOwned:any=[]
  // if(info.totalNodes){
    nanoNodesOwned = info.totalNodes?.filter((node:any) => node.nodeType == 0 && node.lendStatus == false && node.borrowStatus == false);
    picoNodesOwned = info.totalNodes?.filter((node:any) => node.nodeType == 1 && node.lendStatus == false && node.borrowStatus == false);
    megaNodesOwned = info.totalNodes?.filter((node:any) => node.nodeType == 2 && node.lendStatus == false && node.borrowStatus == false);
    gigaNodesOwned = info.totalNodes?.filter((node:any) => node.nodeType == 3 && node.lendStatus == false && node.borrowStatus == false);
  // }
  const [nodeCount, setNodeCount] = useState({
    nano:0,
    pico:0,
    mega:0,
    giga:0
  });

  const [notification, setNotification] = useState("Select Nodes Carefully");
  const cards2 = [
    {
      name: "Nano Node",
      amount: nanoNodesOwned?.length,
      status: "Count :",
    },
    {
      name: "Pico Node",
      amount: picoNodesOwned?.length,
      status: "Count :",
    },
    {
      name: "Mega Node",
      amount: megaNodesOwned?.length,
      status: "Count :",
    },
    {
      name: "Giga Node",
      amount: gigaNodesOwned?.length,
      status: "Count :",
    },
  ];

  const clickMerge = async (e:any) => {
    e.preventDefault();
    let sum = nodeCount.nano * 10 + nodeCount.pico * 20 + nodeCount.mega * 50 + nodeCount.giga * 100;
    checked.splice(0,checked.length)
    if ((nodeCount.nano == 0 && nodeCount.pico == 0 && nodeCount.mega == 0 && nodeCount.giga == 1) || 
    (nodeCount.nano == 0 && nodeCount.pico == 0 && nodeCount.mega == 1 && nodeCount.giga == 0) || 
    (nodeCount.nano == 0 && nodeCount.pico == 1 && nodeCount.mega == 0 && nodeCount.giga == 0) ||
    (nodeCount.nano == 1 && nodeCount.pico == 0 && nodeCount.mega == 0 && nodeCount.giga == 0))
      {
        setNotification("Select Nodes Carefully");
        return;
      }
    if (sum == 20){
      setNotification("you can merge Pico Node");
      await getNodeIndex()
      await handleUpgrade(1)
    }else if (sum == 50){
      setNotification("you can merge Mega Node");
      await getNodeIndex()
      await handleUpgrade(2)
    }else if (sum == 100){
      setNotification("you can merge Giga Node");
      getNodeIndex()
      handleUpgrade(3)
    }else {
      setNotification("Select Nodes Carefully");
    }
  }

  const handleUpgrade = async (type:number) => {
    setLoading(true)
    try {
      upgradeNode(type,checked).then(async () => {
        toast.success(`Successfully Upgraded`)
        // await multicall()
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

  const getNodeIndex = async () => {
    for (let i = 0; i < nodeCount.nano; i++) {
      checked.push(String(nanoNodesOwned[i].nodeIndex))
      setChecked([...checked])
    } 
    for (let i = 0; i < nodeCount.pico; i++) {
      checked.push(String(picoNodesOwned[i].nodeIndex))
      setChecked([...checked])
    }
    for (let i = 0; i < nodeCount.mega; i++) {
      checked.push(String(megaNodesOwned[i].nodeIndex))
      setChecked([...checked])
    } 
  }
  const renderButton = (card:any) => {
    if (card.name == "Nano Node"){
      return (
        <input type = "number" min = "0" max = {card.amount} value = {nodeCount.nano} onChange={e => setNodeCount({...nodeCount,nano:Number(e.target.value)})}className = "mt-8 w-[100px] bg-white px-2 py-2 text-sm font-medium rounded-xl text-black text-right" />
      )
    }else if (card.name == "Pico Node"){
      return (
        <input type = "number" min = "0" max = {card.amount} value = {nodeCount.pico} onChange={e => setNodeCount({...nodeCount,pico:Number(e.target.value)})}className = "mt-8 w-[100px] bg-white px-2 py-2 text-sm font-medium rounded-xl text-black text-right" />
      )
    }else if (card.name == "Mega Node"){
      return (
        <input type = "number" min = "0" max = {card.amount} value = {nodeCount.mega} onChange={e => setNodeCount({...nodeCount,mega:Number(e.target.value)})}className = "mt-8 w-[100px] bg-white px-2 py-2 text-sm font-medium rounded-xl text-black text-right" />
      )
    }else if (card.name == "Giga Node"){
      return (
        <input type = "number" min = "0" max = {card.amount} value = {nodeCount.giga} onChange={e => setNodeCount({...nodeCount,giga:Number(e.target.value)})}className = "mt-8 w-[100px] bg-white px-2 py-2 text-sm font-medium rounded-xl text-black text-right" />
      )
    }
  }
  return (
    <div className={classNames(loading?"loading":"")}>
      <div className="py-6 bg-white min-h-screen dark:bg-black">
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8 flex flex-col">
          <h2 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-gray-100 mb-5">
            Merge Nodes 🗻️
          </h2>
          <div className = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            {cards2.map((card) => (
              <div
                key={card.name}
                className="bg-gray-100 dark:bg-gray-900 overflow-hidden shadow rounded-lg"
                >
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="ml-1 w-0 flex-1">
                            <dl>
                                <dt className="text-m font-medium text-gray-900 dark:text-gray-100 truncate flex">
                                {card.name}
                                </dt>
                                <dd className = "flex flex-row items-center justify-between">
                                  <div className="font-medium text-gray-900 dark:text-gray-100 mt-10 text-xl">
                                    {card.status} {card.amount}
                                  </div>
                                  {renderButton(card)}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
            ))}

          </div>
          <div className = "flex items-center flex-col md:mt-8">
            <h2 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-gray-100 mt-5">{notification}</h2>
            <button className = "w-1/3 bg-cyan-400 text-black dark:text-white mt-[50px] h-[100px] rounded text-[30px]" onClick = {(e) => clickMerge(e)}>Merge</button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
