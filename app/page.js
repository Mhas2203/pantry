'use client';
import Image from "next/image";
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { Box, Modal, Typography, Stack, TextField, Button } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, getDoc, setDoc } from '@firebase/firestore';

export default function Home() {
  const [inventory, setInventory] = useState([]); // State for inventory items
  const [open, setOpen] = useState(false); // State for modal open/close
  const [itemName, setItemName] = useState(''); // State for item name input
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  // Function to update the inventory from Firestore
  const updateInventory = async () => {
    const snapshot = await getDocs(collection(firestore, 'inventory'));
    const inventoryList = [];
    snapshot.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  // Function to add an item to the inventory
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory();
    handleClose();
  };

  // Function to remove an item from the inventory
  const removeItem = async (item) => {
  const docRef = doc(collection(firestore, 'inventory'), item);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const { quantity } = docSnap.data();
    if (quantity === 1) {
      await deleteDoc(docRef); // Delete the document if quantity is 1
    } else {
      await setDoc(docRef, { quantity: quantity - 1 }); // Decrement the quantity
    }
    await updateInventory(); // Refresh the inventory list
  }
};

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true); // Open modal
  const handleClose = () => setOpen(false); // Close modal

  // Filtered inventory based on search query
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="59vw"
      display="flex"
      overflow="hidden"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      sx={{
        backgroundImage: 'url(/images/pantry.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'white',
      }}
    >
      {/* Add Item Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Typography variant="h6">Add New Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName('');
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      
      {/* Add Item Button */}
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{
          bgcolor: '#D2B48C',
          color: 'white',
          '&:hover': {
            backgroundColor: '#122233'
          }
        }}
      >
        Add
      </Button>
      
      {/* Search Input Field */}
      <TextField
  variant="outlined"
  placeholder="Search for an item"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  sx={{
    marginBottom: 2,
    backgroundColor: '#fff', // Background color of the input
    borderColor: '#D2B48C', // Border color
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#D2B48C', // Border color
      },
      '&:hover fieldset': {
        borderColor: '#8B4513', // Border color on hover
      },
      '&.Mui-focused fieldset': {
        borderColor: '#8B4513', // Border color when focused
      },
    },
    '& .MuiInputBase-input': {
      color: '#980', // Text color inside the input
    }
  }}
/>


      {/* Pantry Items Header */}
      <Box border="1px solid #333">
        <Box
          width="800px"
          height="100px"
          display="flex"
          bgcolor="rgba(220, 180, 100, 0.5)"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h2" color="#333">Pantry Items</Typography>
        </Box>
      </Box>
      
      {/* Inventory List */}
      <Stack width="800px" height="300px" spacing={2} overflow="auto">
        {filteredInventory.map(({ name, quantity }) => (
          <Box
            key={name}
            width="auto"
            minHeight="150px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bgcolor="rgba(210, 180, 140, 0.5)"
            padding={5}
          >
            {/* Item Name (left) */}
            <Typography variant="h5" bgcolor="#bdb76b" textAlign="left" flex={1}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>

            <Button
              variant="contained"
              onClick={() => removeItem(name)}
              sx={{
                backgroundColor: '#1223',
                '&:hover': {
                  backgroundColor: '#122233'
                }
              }}
            >
              -
            </Button>

            {/* Quantity and Buttons (right) */}
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h5" color="#333" textAlign="center">
                {quantity}
              </Typography>

              <Button
                variant="contained"
                onClick={() => addItem(name)}
                sx={{
                  backgroundColor: '#1223',
                  '&:hover': {
                    backgroundColor: '#122233'
                  }
                }}
              >
                +
              </Button>
              <Button
                variant="contained"
                onClick={() => removeItem(name)}
              >
                Remove
              </Button>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
