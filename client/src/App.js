import { ethers } from "ethers";
import { useEffect, useState } from "react";
import "./App.css";
import Upload from "./artifacts/contracts/Upload.sol/Upload.json";
import Display from "./components/Display";
import FileUpload from "./components/FileUpload";
import Modal from "./components/Modal";

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
            const contract = new ethers.Contract(
              contractAddress,
              Upload.abi,
              signer
            );
            setContract(contract);
          } else {
            console.error("Contract address is not set");
          }
          setProvider(provider);
        } catch (error) {
          console.error(
            "Error requesting accounts or initializing contract:",
            error
          );
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
      <div className="main-container">
        {!modalOpen && (
          <button className="share-button" onClick={() => setModalOpen(true)}>
            Share
          </button>
        )}
        {modalOpen && <Modal setModalOpen={setModalOpen} contract={contract} />}

        <div className="App">
          <h1 className="title">Secure-Docs</h1>
          <div className="background">
            <div className="bg"></div>
            <div className="bg bg2"></div>
            <div className="bg bg3"></div>
          </div>
          <p className="account-info">
            Account: {account ? account : "Not connected"}
          </p>
          <FileUpload
            account={account}
            provider={provider}
            contract={contract}
          />
          <Display contract={contract} account={account} />
        </div>
      </div>
    </>
  );
}

export default App;
