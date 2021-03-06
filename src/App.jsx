import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from './utils/WavePortal.json';
import './App.css';

export default function App() {

  /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [showMessage,setShowMessage] = React.useState(false);
  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0x01315942880b9Fd10D0B0292F35e04CbE3c2D9fe";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
      try {
        /*
        * First make sure we have access to window.ethereum
        */
        const { ethereum } = window;

        if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
        } else {
          console.log("We have the ethereum object", ethereum);
        }

        /*
        * Check if we're authorized to access the user's wallet
        */
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account)
          getAllWaves();
        } else {
          console.log("No authorized account found")
        }
      } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const getAllWaves = async () => {
    try {
      const onNewWave = (from, timestamp, message) => {
        console.log('NewWave', from, timestamp, message);
        setAllWaves(prevState => [
          ...prevState,
          {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message,
          },
        ]);
      };

      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        wavePortalContract.on('newWave', onNewWave);

        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTransaction = await wavePortalContract.wave("A message", { gasLimit: 300000 });
        console.log("Mining.....", waveTransaction.hash);

        await waveTransaction.wait();
        console.log("Mined.....", waveTransaction.hash);

        setShowMessage(true);
        setTimeout(() => {
            setShowMessage(false);
          }, 6000);
        
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
}
  
  return (
    <div className="mainContainer">
      {showMessage && (
       <div style={{position: "absolute", top: "5px", color: "green"}}>Your Wave is Recorded! Thanks For Waving ????</div>
      )}
      <div className="dataContainer">
        <div className="header">
        ???? Hey there!
        </div>

        <div className="bio">
        Sanket here! don't forget to wave :)
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.length > 0 && (
          <h4 style={{ color: "cadetblue" }}> Wavers: </h4>
        )}
        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
