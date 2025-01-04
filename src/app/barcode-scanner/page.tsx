'use client';

import React, { useState, useEffect } from 'react';
import Quagga from 'quagga';
import { getInventoryByBarcodeID, postTool, getToolsByReserverID, deleteToolsByReserverID } from './utils';
import './style.css'; // Import the CSS file

const BarcodeScanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [inventory, setInventory] = useState<any | null>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [reserverID, setReserverID] = useState<string>('');

  useEffect(() => {
    // Fetch the list of tools checked out by the reserver
    const fetchTools = async () => {
      try {
        if (reserverID) {
          const toolsResponse = await getToolsByReserverID(reserverID);
          console.log('Tools checked out:', toolsResponse);

          // Ensure toolsResponse contains a tools array
          if (toolsResponse && Array.isArray(toolsResponse.tools)) {
            setTools(toolsResponse.tools);
          } else {
            setTools([]);
          }
        }
      } catch (error) {
        console.error('Error fetching tools:', error);
        setTools([]);
      }
    };

    fetchTools();
  }, [reserverID]);

  useEffect(() => {
    if (scanning) {
      Quagga.init({
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: document.querySelector('#interactive')!
        },
        locator: {
          patchSize: 'medium',
          halfSample: true
        },
        decoder: {
          readers: ['code_128_reader', 'ean_reader', 'upc_reader']
        },
        locate: true
      }, (err) => {
        if (err) {
          console.error('Initialization error:', err);
          return;
        }
        Quagga.start();
      });

      Quagga.onDetected(async (data) => {
        const scannedBarcode = data.codeResult.code;
        console.log('Barcode detected and processed:', scannedBarcode);
        alert(`Scanned Barcode: ${scannedBarcode}`);

        // Get the inventory object
        try {
          const inventoryResponse = await getInventoryByBarcodeID(scannedBarcode);
          console.log('Retrieved inventory (stringified):', JSON.stringify(inventoryResponse, null, 2));
          setInventory(inventoryResponse.inventory);

          // Extract name and category from nested inventory object
          if (inventoryResponse && inventoryResponse.inventory) {
            const { name, category } = inventoryResponse.inventory;
            console.log('Name:', name);
            console.log('Category:', category);

            // Post the tool
            await postTool({ name, category, reserverID });
            console.log('Tool posted successfully');

            // Refresh the list of checked out tools
            const toolsResponse = await getToolsByReserverID(reserverID);
            setTools(Array.isArray(toolsResponse.tools) ? toolsResponse.tools : []);
          } else {
            console.error('Inventory object is null or undefined');
          }
        } catch (error) {
          console.error('Error retrieving or posting tool:', error);
        }

        setBarcode(scannedBarcode);
        setScanning(false);
        Quagga.stop();
      });

      return () => {
        Quagga.stop();
      };
    }
  }, [scanning, reserverID]);

  const handleStartScanning = () => {
    setScanning(true);
  };

  const handleCheckInTool = async (toolName: string) => {
    try {
      await deleteToolsByReserverID(reserverID, toolName);
      console.log(`Tool ${toolName} checked in successfully`);

      // Refresh the list of checked out tools
      const toolsResponse = await getToolsByReserverID(reserverID);
      setTools(Array.isArray(toolsResponse.tools) ? toolsResponse.tools : []);
    } catch (error) {
      console.error(`Error checking in tool ${toolName}:`, error);
    }
  };

  return (
    <div className="container">
      <header>
        TOOLS
      </header>
      <div>
        <label htmlFor="reserverID">Enter your name:</label>
        <input
          type="text"
          id="reserverID"
          value={reserverID}
          onChange={(e) => setReserverID(e.target.value)}
        />
      </div>
      {!scanning && <button onClick={handleStartScanning}>Start Scanning</button>}
      {scanning && <div id="interactive" className="viewport" />}
      {barcode && <p>Scanned Barcode: {barcode}</p>}
      {inventory && <pre>{JSON.stringify(inventory, null, 2)}</pre>}
      <h2>Checked Out Tools</h2>
      {tools.length === 0 ? (
        <p>No tools checked out</p>
      ) : (
        <ul className="checked-out-tools">
          {tools.map((tool, index) => (
            <li key={index} className="tool-item">
              <span className="tool-name">
                <span className="green-dot"></span>
                {tool.name} - {tool.category}
              </span>
              <button onClick={() => handleCheckInTool(tool.name)}>Check In</button>
            </li>
          ))}
        </ul>
      )}
      {/* Render the full JSON of tools */}
      <pre>{JSON.stringify(tools, null, 2)}</pre>
    </div>
  );
};

export default BarcodeScanner;
