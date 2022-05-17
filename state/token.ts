import { eth } from "state/eth" // ETH state provider
import { ethers } from "ethers" // Ethers
import { Contract, Provider, setMulticallAddress } from "ethers-multicall"
import { useEffect, useState } from "react" // React
import { createContainer } from "unstated-next" // State management
import { BigNumber, formatFixed } from "@ethersproject/bignumber"
import { parseEther, formatEther, parseUnits } from "ethers/lib/utils"
import { CONTRACT_HONE, CONTRACT_GHONE, CONTRACT_NODEMANAGER, CONTRACT_NFT, CONTRACT_MULTICALL, TOKEN_MAINTENANCE } from "./address"

const NodeManagerABI = require("abi/HarmonyNodeManageTest.json")
const HONEABI = require("abi/HONE.json")
const USDCABI = require("abi/ERC20Mock.json")
const ERC20ABI = require("abi/ERC20.json")
const NFTABI = require("abi/HarmonyNode.json")
const PairABI = require("abi/IUniswapV2Pair.json")
const MulticallABI = require("abi/Multicall.json")
const UINT256_MAX = '1000000000000000000000000000000000000000000000000000000000000000'

let contractNodeManager: ethers.Contract
let contractHone: ethers.Contract
let contractNFT: ethers.Contract
let contractUSDC: ethers.Contract
let contractPair: ethers.Contract

function useToken() {
  const {address,provider} = eth.useContainer()
  const defaultProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
  const [tiers, setTiers] = useState<any[]>([])
  const [info, setInfo] = useState<any>({})

  const getContract = (address: string, abi: any) => {
    return new ethers.Contract(
      address,
      abi,
      address?provider?.getSigner():defaultProvider
    )
  }

  const loadContracts = async () => {
    contractNodeManager = getContract(CONTRACT_NODEMANAGER, NodeManagerABI)
    contractHone = getContract(CONTRACT_HONE, HONEABI)
    contractNFT = getContract(CONTRACT_NFT, NFTABI)
    contractUSDC = getContract(TOKEN_MAINTENANCE,ERC20ABI )
  }

  const approve = async () => {
    const tx = await contractHone.approve(CONTRACT_NODEMANAGER, UINT256_MAX)
    await tx.wait()
  }

  const approveUSDC = async () => {
    const tx = await contractUSDC.approve(CONTRACT_NODEMANAGER, UINT256_MAX)
    await tx.wait()
  }

  const createNode = async (honeAmount:BigNumber, nodeType:number)=>{
    await(await contractNodeManager.createNode(honeAmount.toString(), nodeType.toString())).wait()
  }

  const upgradeNode = async (nodeType:number, nodes:any)=>{
    await(await contractNodeManager.upgradeNode(nodeType,nodes)).wait()
  }

  const listLendOffer = async (nodeIndex:number,amount:BigNumber, months:number) => {
    await(await contractNodeManager.listLendOffer(nodeIndex,amount, months)).wait()
  }

  const closeLendOffer = async (offerIndex:number) => {
    await(await contractNodeManager.closeLendOffer(offerIndex)).wait()
  }

  const acceptLendOffer = async (offerIndex:number) => {
    await(await contractNodeManager.acceptLendOffer(offerIndex)).wait()
  }
  const approveToOwner = async (owner: string, amount:BigNumber) => {
    const tx = await contractHone.approve(owner, amount)
    await tx.wait()
  }

  const approveNft = async () => {
    await(await contractNFT.setApprovalForAll(CONTRACT_NODEMANAGER, true)).wait()
  }

  const swapNode = async (nftId:string) =>{
    await(await contractNodeManager.swapNode(nftId)).wait()
  }

  const claimRewards = async () => {
    await (await contractNodeManager.claimRewards()).wait()
  }

  const payMaintenanceFee = async (nodeID:number) => {
    await(await contractNodeManager.payMaintenanceFee(nodeID)).wait()
  }

  const payAllMaintenanceFee = async () => {
    await(await contractNodeManager.payAllMaintenanceFee()).wait()
  }








  const getTiers = async () : Promise<any[]>=>{
    return await contractNodeManager.tiers()
  }

  const getNodes = async (account:string) : Promise<any[]>=>{
    return await contractNodeManager.nodes(account)
  }

  const getUpgradeFee = async (tierFrom:string, tierTo:string, count:number) : Promise<any>=>{
    return await contractNodeManager.getUpgradeFee(tierFrom,tierTo,count)
  }

  const getUnpaidNodes = async () : Promise<any[]>=>{
    return await contractNodeManager.unpaidNodes()
  }

 

  const compoundNode = async (tier:string, count:number)=>{
    await(await contractNodeManager.compound(tier, '', count)).wait()
  }

  const transferNode = async (tier:string, count:number, account:string)=>{
    await(await contractNodeManager.transfer(tier, count, account)).wait()
  }

  const burnNode = async (nodes:number[])=>{
    await(await contractNodeManager.burnNodes(nodes)).wait()
  }

  const claim = async ()=>{
    await(await contractNodeManager.claim()).wait()
  }

  const pay = async (months:number,nodes:number[],fee:BigNumber)=>{
    await(await contractNodeManager.pay(months,nodes)).wait()
  }

  const mintNode = async (accounts:string[],tierName:string,count:number)=>{
    await(await contractNodeManager.mint(accounts,tierName,'',count)).wait()
  }

  const allowance = async () : Promise<boolean>=>{
    if(address) {
      const allowance = await contractHone.allowance(address, contractNodeManager.address)
      if(allowance==undefined) return false
      return allowance.gt(0)
    }
    return false
  }
  const allowanceBusd = async () : Promise<boolean>=>{
    if(address) {
      const allowance = await contractUSDC.allowance(address, contractNodeManager.address)
      if(allowance==undefined) return false
      return allowance.gt(0)
    }
    return false
  }

  

  

  const multicall = async () => {
    await setMulticallAddress(1666600000,CONTRACT_MULTICALL)
    const Multicall = new Provider(provider??defaultProvider)
    await Multicall.init()
    const NodeManager = new Contract(
      CONTRACT_NODEMANAGER,
      NodeManagerABI
    )

    const Hone = new Contract(CONTRACT_HONE, ERC20ABI)

    const GHone = new Contract(CONTRACT_GHONE, ERC20ABI)

    const Pair = info.pairAddress? new Contract(info.pairAddress, PairABI): undefined
      
    const NFT = new Contract(
      CONTRACT_NFT,
      NFTABI
    )
    const TokenMaintenance = new Contract(
      TOKEN_MAINTENANCE,
      USDCABI
    )
    const calls = []
    if(!info.pairAddress) calls.push(NodeManager.uniswapV2Pair())
    if(Pair != undefined) {
      calls.push(Pair.token0())
      calls.push(Pair.getReserves())
      calls.push(Pair.price0CumulativeLast())
    }
    if(!info.totalSupply) calls.push(Hone.totalSupply())
    

    if(address) {
      calls.push(Hone.balanceOf(address))
      calls.push(GHone.balanceOf(address))
      calls.push(Hone.allowance(address,NodeManager.address))
      calls.push(NFT.isApprovedForAll(address, NodeManager.address))
      calls.push(TokenMaintenance.allowance(address, NodeManager.address))
      calls.push(NodeManager.getClaimableRewards(address))
      calls.push(NFT.walletOfOwner(address))
      calls.push(NodeManager.getNodeCount(address))
      if(info.countTotal>0) calls.push(NodeManager.getNodes(address))
      calls.push(NodeManager.getLendOffers(address,false))
      calls.push(NodeManager.getLendOffers(address,true))
      calls.push(NFT.walletOfOwner(address))
      
      
      
      

      // calls.push(NodeManager.getLendOffers(address, true))
      // calls.push(NodeManager.getClaimableRewards(address))
      // if(TokenMaintenance) {
      //   calls.push(TokenMaintenance.balanceOf(address))
      //   calls.push(TokenMaintenance.allowance(address,NodeManager.address))
      // }
    }
    if(calls.length) {
      
      const ret = await Multicall.all(calls)
      let index = 0
      if(!info.pairAddress) info.pairAddress = ret[index++]
      if(Pair != undefined) {
        const token0 = ret[index++]
        const reserves = ret[index++]
        console.log(token0.toLowerCase()==CONTRACT_HONE)
        if(token0.toLowerCase()==CONTRACT_HONE)
          info.priceHONE = reserves[1].gt(0)?reserves[0].mul(ethers.utils.parseUnits("1",12)).mul(ethers.utils.parseUnits("1",18)).div(reserves[1]):BigNumber.from(0)
        else
          info.priceHONE = reserves[1].gt(0)?reserves[0].mul(ethers.utils.parseUnits("1",12)).mul(ethers.utils.parseUnits("1",18)).div(reserves[1]):BigNumber.from(0)

          info.price0CumulativeLast = ret[index++]
      }
      if(!info.totalSupply) info.totalSupply = ret[index++]
      
      
      if(address) {
        info.balanceOfHone = ret[index++]
        info.balanceOfGHone = ret[index++]
        info.approvedHone = BigNumber.from(ret[index++]).gt(0)
        info.approvedNFT = ret[index++]
        info.approvedUSDC = BigNumber.from(ret[index++]).gt(0)
        info.claimableAmount = ret[index++]
        info.nftTokenIds = ret[index++]
        info.countTotal = ret[index++]
        if(info.countTotal>0) {
          info.totalNodes = ret[index++]
          console.log("info.totalNodes",info.totalNodes);
        }
        info.lendOffers = ret[index++]
        info.lendOffersAll = ret[index++]
        info.nfts = ret[index++]
        
        
        // info.pendingRewards = ret[index++]
        // if(TokenMaintenance) {
        //   info.balanceMaintenance = ret[index++]
        //   info.approvedMaintenance = BigNumber.from(ret[index++]).gt(0)
        // }
      }
      setInfo({...info})
    }
  }

  useEffect(() => {
    let timer : NodeJS.Timer
    loadContracts().then(() => {
      
      timer = setInterval(()=>multicall(), 3000)
    })
    return ()=>clearInterval(timer)
  })
  
  return {
    info, 
    listLendOffer, 
    closeLendOffer,
    acceptLendOffer,
    approveToOwner,
    claimRewards,
    approveNft,
    swapNode,
    payMaintenanceFee,
    payAllMaintenanceFee,
    getTiers, 
    allowance, 
    allowanceBusd,
    approve, 
    approveUSDC,
    getNodes, 
    getUnpaidNodes,
    mintNode,
    createNode, 
    compoundNode, 
    transferNode, 
    upgradeNode, 
    burnNode,
    pay, 
    claim, 
    multicall,
  }
}

export const token = createContainer(useToken)
