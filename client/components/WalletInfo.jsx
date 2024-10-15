export default function WalletInfo({ balance = "7.150", address = "0xEe29...b8B2" }) {
     // Function to trim the address for better display
     const formatAddress = (address) => {
       return `${address.slice(0, 6)}...${address.slice(-4)}`;
     };
   
     // Function to format the balance to 4 decimal places
     const formatBalance = (balance) => {
          const balanceNumber = parseFloat(balance);
          // Convert the balance to a string to check its decimal length
          const balanceStr = balanceNumber.toString();
        
          // Check if the balance has more than 5 decimal places
          if (balanceStr.includes('.')) {
            const decimalPart = balanceStr.split('.')[1];
            // If decimal part length is greater than 5, format to 5 decimal places
            if (decimalPart.length > 5) {
              return balanceNumber.toFixed(5);
            }
          }
        
          // Return the balance without formatting if it has 5 or fewer decimal places
          return balanceNumber.toString();
        };
   
     return (
       <div className="flex items-center bg-gray-900 text-white p-4 rounded-lg w-80 shadow-lg transition-width duration-300">
         {/* Polygon Logo */}
         <img
           src="https://cryptologos.cc/logos/polygon-matic-logo.png?v=035"
           alt="Polygon"
           className="w-10 h-10 mx-3"
         />
   
         {/* Wallet Information */}
         <div className="flex-grow text-center">
           {/* Display Balance */}
           <div className="text-lg font-bold">{formatBalance(balance)} ETH</div>
   
           {/* Display formatted account address */}
           <div className="text-sm text-gray-400">{formatAddress(address)}</div>
         </div>
   
         {/* MetaMask Logo */}
         <img
           src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
           alt="MetaMask"
           className="w-12 h-12 mx-3"
         />
       </div>
     );
   }
   