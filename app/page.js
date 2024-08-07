'use client';
import Image from "next/image";
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import axios from 'axios';
import { Box, Modal, Typography, Stack, TextField, Button, withTheme } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, getDoc, setDoc } from '@firebase/firestore'

const SPOONACULAR_API_KEY = '9a5e4c8615464c02befb92b6b8fafa33';

export default function Home() {
  const [inventory, setInventory] = useState([]); // State for inventory items
  const [open, setOpen] = useState(false); // State for modal open/close
  const [itemName, setItemName] = useState(''); // State for item name input
  const [recipes, setRecipes] = useState([]); // State for fetched recipes


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
  };
  
  // Function to remove an item from the inventory
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    await deleteDoc(docRef); 
    await updateInventory();
  };
  //Recipe fetch
  const fetchRecipes = async () => {
    try {
      const ingredients = inventory.map(item => item.name).join(', ');
      const response = await axios.get(`https://api.spoonacular.com/recipes/findByIngredients`, {
        params: {
          ingredients: ingredients,
          number: 5, // Number of recipes to fetch
          apiKey: SPOONACULAR_API_KEY
        }
      });
  
      setRecipes(response.data); // Update state with the fetched recipes
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };  
  
  const decreaseQuantity = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity > 1) {
        await setDoc(docRef, { quantity: quantity - 1 });
      } else {
        await deleteDoc(docRef); // Optionally remove item if quantity is 1 and it should be removed
      }
    }
    await updateInventory(); // Update the inventory state
  };
   

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true); // Open modal
  const handleClose = () => setOpen(false); // Close modal

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
        backgroundSize: 'cover',       // Ensures the image covers the entire area
      backgroundPosition: 'center',  // Centers the image
      backgroundRepeat: 'no-repeat', // Prevents the image from repeating
      backgroundColor: 'white',      // Sets the background color to white
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
        bgcolor: '#D2B48C', // Background color
        color: 'white',        // Text color
        '&:hover': {
          backgroundColor: '#122233' // Hover state
        }
      }}
      >
        Add
      </Button>
      
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
        {inventory.map(({ name, quantity }) => (
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
              onClick={() => {
              decreaseQuantity(name);
            }}
              sx={{ 
                backgroundColor: '#1223', // Normal state
                '&:hover': {
                  backgroundColor: '#122233' // Hover state
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
                onClick={() => {
                  addItem(name);
                }}
                sx={{ 
                  backgroundColor: '#1223', // Normal state
                  '&:hover': {
                    backgroundColor: '#122233' // Hover state
                  }
                }}
              >
                +
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  removeItem(name);
                }}
              >
                Remove
              </Button>
{/* Generate Recipes Button */}
<Button
        variant="contained"
        onClick={fetchRecipes}
        sx={{
          bgcolor: '#D2B48C', // Background color
          color: 'white',        // Text color
          '&:hover': {
            bgcolor: '#122233' // Hover state
          }
        }}
      >
        Generate Recipes
      </Button>

            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}