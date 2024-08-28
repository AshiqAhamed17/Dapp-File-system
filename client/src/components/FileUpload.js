import axios from "axios";
import { useState } from "react";
import "./FileUpload.css";

const FileUpload = ({ contract, account, provider }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No image selected");
  const [loading, setLoading] = useState(false);
  //const [result, setResult] = useState();
  //result = file;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setLoading(true);
    try {
      console.log("Submitting file:", file); // Debugging line
      //setResult(result);

      const formData = new FormData();
      formData.append("file", file);

      // Check that the API keys are correctly loaded
      console.log("API Key:", process.env.REACT_APP_PINATA_API_KEY);
      console.log("API Secret:", process.env.REACT_APP_PINATA_SECRET_API_KEY);

      const resFile = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            pinata_api_key: "196a82362190c3ca81f7",
            pinata_secret_api_key:
              "7f76cdf21f827619461e0ee097be619462e58d438cef850dc3d6962d8bbdd047",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      console.log("IPFS Hash:", ImgHash); // Debugging line
      contract.add(account, ImgHash);
      const signer = contract.connect(provider.getSigner());
      signer.add(account, ImgHash);
      if (contract) {
        const tx = await contract.add(account, ImgHash);
        await tx.wait();
        alert("File successfully uploaded and transaction confirmed!");
      } else {
        alert("Contract is not defined");
      }

      setFileName("No image selected");
      setFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      //alert("Unable to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const retrieveFile = (e) => {
    const data = e.target.files[0];
    console.log(`retrieving data ${data}`);
    if (data) {
      setFile(data);
      setFileName(data.name);
    }
    e.preventDefault();
  };

  return (
    <div className="top">
      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="file-upload" className="choose">
          Choose Image
        </label>
        <input
          disabled={!account}
          type="file"
          id="file-upload"
          name="data"
          onChange={retrieveFile}
        />
        <span className="textArea">Image: {fileName}</span>
        <button type="submit" className="upload" disabled={!file || loading}>
          {loading ? "Uploading..." : "Upload File"}
        </button>
      </form>
     
    </div>
  );
};

export default FileUpload;
