"use client"

import { Button } from "./ui/button"

const WalletButton = ({isConnected, onConnect, onDisconnect}) => {
  return (
     <Button
        className="px-5 py-6 font-semibold tracking-[0.1em] bg-blue-800 text-white rounded-3xl shadow-md hover:bg-blue-700  transition-all duration-300 ease-in-out" 
     
     onClick={isConnected ? onDisconnect : onConnect}
      > 
      {isConnected ? `Disconnect` : `Connect Wallet`}
      </Button>
  )
}

export default WalletButton