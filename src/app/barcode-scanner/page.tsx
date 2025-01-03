import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { 
  getInventoryByBarcodeID, 
  postTool, 
  postInventoryDecreaseCountByName, 
  getToolsByReserverID, 
  postInventoryIncreaseCountByName, 
  deleteToolsByReserverID 
} from './utils';
import { BrowserMultiFormatReader } from '@zxing/library';

const Page: React.FC = () => {
  const [barcode, setBarcode] = useState('');
  const [message, setMessage] = useState('');
  interface Tool {
    name: string;
    // Add other properties if needed
  }
  
  const [tools, setTools] = useState<Tool[]>([]);
  const webcamRef = useRef<Webcam>(null);

  const handleScan = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const codeReader = new BrowserMultiFormatReader();
        try {
          const result = await codeReader.decodeFromImage(undefined, imageSrc);
          setBarcode(result.getText());
        } catch (error) {
          console.error('Error scanning barcode:', error);
          setMessage('Error scanning barcode');
        }
      }
    }
  };

  const handleBarcodeProcess = async () => {
    try {
      const inventory = await getInventoryByBarcodeID(barcode);
      if (inventory) {
        // Reserve new tool
        await postTool({ 
          barcodeId: barcode, 
          name: inventory.name, 
          category: inventory.category, 
          reserverID: 'ReserverID' 
        });
        await postInventoryDecreaseCountByName(inventory.name);
        setMessage(`Tool reserved: ${inventory.name}`);
      } else {
        setMessage('Tool not found in inventory');
      }
    } catch (error) {
      setMessage('Error handling barcode');
    }
    loadTools();
  };

  const loadTools = async () => {
    const userTools = await getToolsByReserverID('ReserverID');
    setTools(userTools.tools);
  };

  const handleCheckIn = async (toolName: string) => {
    try {
      await postInventoryIncreaseCountByName({ name: toolName });
      await deleteToolsByReserverID('ReserverID', toolName);
      setMessage(`Tool checked in: ${toolName}`);
    } catch (error) {
      setMessage('Error checking in tool');
    }
    loadTools();
  };

  useEffect(() => {
    loadTools();
  }, []);

  return (
    <div>
      <h1>Tool Reservation</h1>
      <Webcam 
        ref={webcamRef}
        screenshotFormat="image/jpeg"
      />
      <button onClick={handleScan}>Scan Barcode</button>
      <input
        type="text"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        placeholder="Scan or enter barcode"
      />
      <button onClick={handleBarcodeProcess}>Submit</button>
      {message && <p>{message}</p>}
      <h2>Your Tools</h2>
      <ul>
        {tools.map((tool) => (
          <li key={tool.name}>
            {tool.name} <button onClick={() => handleCheckIn(tool.name)}>Check In</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Page;
