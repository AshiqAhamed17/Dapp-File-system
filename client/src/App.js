import Upload from "./artifacts/contracts/Upload.sol/Upload.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import FileUpload from "./components/FileUpload";
import Display from "./components/Display";
import Modal from "./components/Modal";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const initializeProvider = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        window.ethereum.on("accountsChanged", async (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            setAccount("");
            setContract(null);
          }
        });

        try {
          await provider.send("eth_requestAccounts", []);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);

          const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
          if (contractAddress) {
            const contract = new ethers.Contract(contractAddress, Upload.abi, signer);
            setContract(contract);
          } else {
            console.error("Contract address is not set");
          }
          setProvider(provider);
        } catch (error) {
          console.error("Error requesting accounts or initializing contract:", error);
        }
      } else {
        console.error("MetaMask is not installed");
      }
    };

    initializeProvider();

    // Cleanup event listeners on component unmount
    return () => {
      window.ethereum.removeListener("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.removeListener("accountsChanged", () => {
        setAccount("");
        setContract(null);
      });
    };
  }, []);

  return (
    <>
      {!modalOpen && (
        <button className="share" onClick={() => setModalOpen(true)}>
          Share
        </button>
      )}
      {modalOpen && (
        <Modal setModalOpen={setModalOpen} contract={contract} />
      )}

      <div className="App">
        <h1 style={{ color: "white" }}>Gdrive 3.0</h1>
        <div className="bg"></div>
        <div className="bg bg2"></div>
        <div className="bg bg3"></div>

        <p style={{ color: "white" }}>
          Account: {account ? account : "Not connected"}
        </p>
        <FileUpload
          account={account}
          provider={provider}
          contract={contract}
        />
        <Display contract={contract} account={account} />
      </div>
    </>
  );
}

export default App;