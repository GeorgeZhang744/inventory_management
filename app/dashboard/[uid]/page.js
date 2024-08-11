"use client";

// Import necessary modules from React and Firebase
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { query, collection, getDocs, getDoc, setDoc, doc, deleteDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

import { UserAuth } from "@/app/context/authContext";
import { db, auth } from "../../firebase";

import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export default function Home({ params }) {
  // States for fetching inventory and adding new items to the inventory
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState("");

  // States for filtering inventory
  const [searchItem, setSearchItem] = useState("");
  const [filteredInventory, setFilteredInventory] = useState([]);

  // States for scanning image functionality
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scannedItems, setScannedItems] = useState([]);
  const [isItemSelected, setIsItemSelected] = useState([]);

  // States for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items to display per page
  const [totalPages, setTotalPages] = useState(1);

  // States for loading animation and error message displaying
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const alertShown = useRef(false); // Ref to track if an alert has been shown

  const router = useRouter();
  const { user } = UserAuth(); // Access the current user from the authentication context
  const uid = params.uid; // Get the user ID from the route parameters

  // Function to update the inventory from the database
  const updateInventory = async () => {
    try {
      // Show loading animation
      setIsLoading(true);

      // Fetching the inventory of the current user from the database using uid
      const userInventoryRef = collection(db, "user", uid, "inventory");
      const docs = await getDocs(query(userInventoryRef));
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() });
      });

      // Update inventory state
      setInventory(inventoryList);

      // Update filtered inventory state for filtered result
      setFilteredInventory(inventoryList);

      // Calculate total pages for pagination
      setTotalPages(Math.max(1, Math.ceil(inventoryList.length / itemsPerPage)));
    } catch (error) {
      console.error("Error fetching user inventory:", error);
    } finally {
      // Hide loading animation
      setIsLoading(false);
    }
  };

  // Function to add a new item to the inventory in the database
  const addItem = async (item) => {
    try {
      // Show loading animation
      setIsLoading(true);

      // Get the docRef of the item in the inventory of the current user
      const docRef = doc(collection(db, "user", uid, "inventory"), item.trim().toLowerCase());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // If the item is already in the inventory, increment its quantity by 1
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      } else {
        // Otherwise create a new document for the item
        await setDoc(docRef, { quantity: 1 });
      }

      // Update and rerender inventory after adding the item
      await updateInventory();
    } catch (error) {
      console.error("Error adding item to inventory:", error);
    } finally {
      // Hide loading animation
      setIsLoading(false);
    }
  };

  // Function to upload a list of items to the inventory in the database
  const uploadListItems = async (itemList) => {
    try {
      // Show loading animation
      setIsLoading(true);

      // Iterate through the list of items to be uploaded
      for (const { name, quantity } of itemList) {
        const docRef = doc(collection(db, "user", uid, "inventory"), name.trim().toLowerCase());
        if (quantity === 0) {
          // Delete item if quantity of the item to be uploaded is 0
          await deleteDoc(docRef);
        } else {
          // Otherwise set the quantity to the corresponding value
          await setDoc(docRef, { quantity: quantity });
        }
      }

      // Update and rerender inventory
      await updateInventory();
    } catch (error) {
      console.error("Error uploading list of items to inventory:", error);
    } finally {
      // Hide loading animation
      setIsLoading(false);
    }
  };

  // Function to remove an item from the inventory in the database
  const removeItem = async (item) => {
    try {
      // Show loading animation
      setIsLoading(true);

      // Get the docRef of the item in the inventory of the current user
      const docRef = doc(collection(db, "user", uid, "inventory"), item.trim().toLowerCase());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();

        if (quantity === 1) {
          // Delete item if quantity is 1 as the quantity of this item will become 0 after removing
          await deleteDoc(docRef);
        } else {
          // Otherwise decrement the quantity of the item by 1
          await setDoc(docRef, { quantity: quantity - 1 });
        }
      }

      // Update and rerender inventory after removing the item
      await updateInventory();
    } catch (error) {
      console.error("Error removing item from inventory:", error);
    } finally {
      // Hide loading animation
      setIsLoading(false);
    }
  };

  const deleteItem = async (item) => {
    try {
      // Show loading animation
      setIsLoading(true);

      // Get the docRef of the item in the inventory of the current user
      const docRef = doc(collection(db, "user", uid, "inventory"), item.trim().toLowerCase());

      // Delete the doc
      await deleteDoc(docRef);

      // Update and rerender inventory after removing the item
      await updateInventory();
    } catch (error) {
      console.error("Error deleting item from inventory:", error);
    } finally {
      // Hide loading animation
      setIsLoading(false);
    }
  };

  // Function to filter inventory based on search term
  const filterInventory = (inventory, searchTerm) => {
    if (!searchTerm) return inventory;
    return inventory.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    // Make sure the user is uploading an image file
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setError("");
    } else if (file) {
      // Display error message if the user uploads file of wrong type
      setError("Please select a valid image file.");
      setSelectedFile(null);
    }
  };

  // Scan the selected image and identify the items in the image
  const scanImage = async () => {
    // Make sure the user uploads an image file first
    if (!selectedFile) {
      setError("Please select a valid image file first");
      return;
    }
    setError("");

    // Pre-process the image file into FormData type so that it can be properly scanned
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Show loading animation
      setIsLoading(true);

      // Send request to the 'api/scanImage' endpoint to scan the image
      const response = await fetch("/api/scanImage", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Receive the scanning result
      const data = await response.json();
      const scannedResult = data.inventory;

      // Update scannedItems to be the result from scanning
      setScannedItems(scannedResult.map((item) => ({ ...item, name: item.name.toLowerCase() })));

      // Set all items as selected
      setIsItemSelected(Array(scannedResult.length).fill(true));

      // Show modal with scanned items
      setShowModal(true);
    } catch (error) {
      console.error("Error scanning image:", error);
    } finally {
      // Hide loading animation
      setIsLoading(false);
    }
  };

  // Add scanned items to the inventory
  const handleAddScannedItems = () => {
    // Helper function that combines two lists of items
    const combinedMap = new Map();
    const addToMap = (array) => {
      array.forEach(({ name, quantity }) => {
        if (!name) return;

        if (combinedMap.has(name)) {
          combinedMap.set(name, combinedMap.get(name) + quantity);
        } else {
          combinedMap.set(name, quantity);
        }
      });
    };

    // Combine the selected items with the ones that were in the inventory originally
    addToMap(inventory);
    addToMap(scannedItems.filter((_, idx) => isItemSelected[idx]));

    // Use the combined inventory list to update the inventory in the database
    const newInventory = Array.from(combinedMap, ([name, quantity]) => ({ name, quantity }));
    uploadListItems(newInventory);

    // Hide modal after adding items
    setShowModal(false);
  };

  // Handle onChange event for the scanned items (update the value of the 'field' of the item at index 'index' of the scanned item list to new 'value')
  const handleEditScannedItem = (index, field, value) => {
    // Make sure the quantity is not negative
    if (field == "quantity") {
      value = Math.abs(value);
    }
    const newItems = [...scannedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setScannedItems(newItems);
  };

  // Toggle selection of scanned items
  const handleSelectScannedItem = (index) => {
    const newIsItemSelected = [...isItemSelected];
    newIsItemSelected[index] = !newIsItemSelected[index];
    setIsItemSelected(newIsItemSelected);
  };

  const handleExport = async () => {
    try {
      // Show loading animation
      setIsLoading(true);

      // Send a POST request to the server to trigger the CSV export
      const response = await fetch("/api/exportInventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inventory), // Convert the inventory array to a JSON string and send it as the request body
      });

      // Check if the response is OK
      if (!response.ok) {
        alert("Invalid inventory data");
        throw new Error("Failed to export inventory");
      }

      // Convert the response into a Blob object representing the CSV file
      const blob = await response.blob();

      // Create a URL for the Blob object to allow downloading it
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a");

      // Set the href attribute to the Blob URL
      a.href = url;

      // Set the download attribute with the desired file name
      a.download = "inventory.csv";

      // Append the anchor to the document body and trigger a click to start the download
      document.body.appendChild(a);
      a.click();

      // Clean up by removing the anchor element from the document
      document.body.removeChild(a);
    } catch (error) {
      // Log any errors that occur during the export process
      console.error("Failed to export CSV:", error);
    } finally {
      // Hide loading animation
      setIsLoading(false);
    }
  };

  // Handle pagination next page
  const handleNextPage = () => {
    // Make sure the current page is not the last page
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle pagination previous page
  const handlePreviousPage = () => {
    // Make sure the current page is not the first page
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Fetch and update inventory when user state changes
  useEffect(() => {
    if (user) {
      // Only fetch the inventory if the user is logged in
      updateInventory();
    } else if (!user && !alertShown.current) {
      // If the user is logged out, redirect him/her to the login page
      alertShown.current = true;
      router.push("/auth/login");
    }
  }, [user]);

  // Initialize filteredInventory and total pages when inventory changes
  useEffect(() => {
    if (user) {
      // Only display the filtered inventory if the user is logged in
      setFilteredInventory(inventory);
      setTotalPages(Math.max(1, Math.ceil(inventory.length / itemsPerPage)));
    }
  }, [inventory, itemsPerPage, user]);

  // Recalculate total pages when filteredInventory changes
  useEffect(() => {
    if (user) {
      setTotalPages(Math.max(1, Math.ceil(filteredInventory.length / itemsPerPage)));
    }
  }, [filteredInventory, itemsPerPage, user]);

  // Scroll to the top of the page whenever the current page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="font-mono">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="text-white text-lg">Inventory Management</div>
        <div className="space-x-2">
          <button onClick={handleExport} className="text-white bg-slate-950 hover:bg-slate-900 p-2 rounded">
            Export
          </button>
          <button
            onClick={async () => {
              alertShown.current = true;
              await signOut(auth); // Sign out the user
              router.push("/auth/login"); // Redirect to login page
            }}
            className="text-white bg-slate-950 hover:bg-slate-900 p-2 rounded"
          >
            Sign Out
          </button>
        </div>
      </nav>
      <main className="flex min-h-screen flex-col items-center justify-between sm:p-12 p-4">
        <div className="z-10 max-w-5xl w-full items-center justify-between text-sm">
          <h1 className="text-4xl p-4 text-center">Inventory Management</h1>
          <div className="bg-slate-800 p-4 rounded-md text-white space-y-4">
            {/* Search Form */}
            <form className="flex items-center space-x-2 text-black">
              <input
                className="flex-grow p-3 border w-3/4"
                type="text"
                placeholder="Enter Item"
                value={searchItem}
                onChange={(e) => {
                  setSearchItem(e.target.value);
                }}
              />
              <button
                className="flex-shrink-0 text-white bg-slate-950 hover:bg-slate-900 p-3 text-lg w-1/4"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  setFilteredInventory(filterInventory(inventory, searchItem));
                }}
              >
                Search
              </button>
            </form>
            {/* Add Item Form */}
            <form className="flex items-center space-x-2 text-black">
              <input
                className="flex-grow p-3 border w-3/4"
                type="text"
                placeholder="Enter Item"
                value={newItem}
                onChange={(e) => {
                  setNewItem(e.target.value);
                }}
              />
              <button
                className="flex-shrink-0 text-white bg-slate-950 hover:bg-slate-900 p-3 text-lg w-1/4"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  addItem(newItem);
                  setNewItem("");
                }}
              >
                Add Item
              </button>
            </form>
            {error && <p className="text-red-500">{error}</p>}
            {/* File Upload Form */}
            <form className="flex items-center space-x-2 text-black">
              <input type="file" onChange={handleFileChange} className="flex-grow p-3 border w-3/4 bg-white cursor-pointer" />
              <button
                className="flex-shrink-0 text-white bg-slate-950 hover:bg-slate-900 p-3 text-lg w-1/4"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  scanImage();
                }}
              >
                Scan Image
              </button>
            </form>

            {/* Inventory List */}
            <ul>
              {currentItems.map((item, id) => (
                <li key={id} className="my-4 w-full flex justify-between bg-slate-950">
                  <div className="p-4 w-full flex justify-between">
                    <span className="capitalize">{item.name}</span>
                    <span>{item.quantity}</span>
                  </div>
                  <div className="flex">
                    <button
                      className="ml-8 p-4 border-l-2 border-slate-900 hover:bg-slate-900 w-16"
                      onClick={() => addItem(item.name)}
                    >
                      +
                    </button>
                    <button
                      className="p-4 border-l-2 border-slate-900 hover:bg-slate-900 w-16"
                      onClick={() => removeItem(item.name)}
                    >
                      -
                    </button>
                    <button
                      className="p-4 border-l-2 border-slate-900 hover:bg-slate-900 w-20"
                      onClick={() => deleteItem(item.name)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {/* Pagination */}
            <div className="flex justify-center my-4">
              <button
                className={`text-white bg-slate-950 px-4 text-lg ${currentPage === 1 ? "" : "hover:bg-slate-900"}`}
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                &larr;
              </button>
              <span className="text-white p-3">
                {currentPage} / {totalPages}
              </span>
              <button
                className={`text-white bg-slate-950 px-4 text-lg ${currentPage === totalPages ? "" : "hover:bg-slate-900"}`}
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>
        {/* Loading Spinner */}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
            <div className="text-center text-white text-2xl">
              <img src="/assets/loading.gif" alt="Loading" className="mx-auto mb-4 w-24 h-24" />
              Loading...
            </div>
          </div>
        )}
        {/* Modal for Scanned Items */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-30">
            <div className="fixed inset-0 bg-black bg-opacity-50"></div>
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full z-10 text-white">
              <h2 className="text-2xl mb-4 text-center">Scanned Items</h2>
              <ul className="mb-4 max-h-96 overflow-y-auto">
                {scannedItems.map((item, index) => (
                  <li key={index} className="flex my-4 p-2 w-full justify-between items-stretch bg-slate-950 text-white">
                    <div className="w-3/5">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleEditScannedItem(index, "name", e.target.value)}
                        className="capitalize p-1 w-full bg-slate-950 hover:bg-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="w-1/5 border-l-2 border-slate-800">
                      <input
                        type="number"
                        value={item.quantity}
                        min="0"
                        onChange={(e) => handleEditScannedItem(index, "quantity", e.target.value)}
                        className="p-1 w-full bg-slate-950 hover:bg-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="flex w-1/5 border-l-2 border-slate-800 hover:bg-slate-900 justify-center">
                      <input
                        type="checkbox"
                        checked={isItemSelected[index]}
                        onChange={() => handleSelectScannedItem(index)}
                        className="ml-2 cursor-pointer"
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end">
                <button className="bg-slate-950 hover:bg-gray-900 text-white p-2" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  className="bg-slate-950 hover:bg-slate-900 text-white p-2 border-l-2 border-slate-800"
                  onClick={handleAddScannedItems}
                >
                  Add Selected Items
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
