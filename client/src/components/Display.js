import { useState } from "react";
import "./Display.css";

const Display = ({ contract, account }) => {
  const [data, setData] = useState(null);

  const getdata = async () => {
    let dataArray;
    const Otheraddress = document.querySelector(".address").value;

    try {
      if (Otheraddress) {
        dataArray = await contract.display(Otheraddress);
      } else {
        dataArray = await contract.display(account);
      }
    } catch (e) {
      alert("You don't have access");
      return;
    }

    if (dataArray && dataArray.length > 0) {
      const images = dataArray.map((item, i) => (
        <a href={`https://gateway.pinata.cloud/ipfs/${item}`} key={i} target="_blank" rel="noopener noreferrer">
          <img
            src={`https://gateway.pinata.cloud/ipfs/${item}`}
            alt={`Uploaded content ${i + 1}`}
            className="image-list"
          />
        </a>
      ));
      setData(images);
    } else {
      alert("No image to display");
      setData(null);
    }
  };

  return (
    <>
      <div className="image-list-container">{data}</div>
      <input
        type="text"
        placeholder="Enter Address"
        className="address"
      />
      <button className="center button" onClick={getdata}>
        Get Data
      </button>
    </>
  );
};

export default Display;