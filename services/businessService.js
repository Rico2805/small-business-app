import { db, auth } from '../config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where,
  setDoc
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Add product (legacy function - use addBusinessProduct instead)
export const addProduct = async (businessId, productData) => {
  try {
    const productsRef = collection(db, 'products');
    const newProduct = await addDoc(productsRef, {
      ...productData,
      businessId,
      createdAt: new Date().toISOString()
    });
    return {
      id: newProduct.id,
      ...productData
    };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// Add business product (new version with stock quantity and image support)
export const addBusinessProduct = async (businessId, productData) => {
  try {
    const productsRef = collection(db, 'products');
    const newProduct = await addDoc(productsRef, {
      ...productData,
      businessId,
      stockQuantity: productData.stockQuantity || 0,
      createdAt: new Date().toISOString()
    });
    return {
      id: newProduct.id,
      ...productData
    };
  } catch (error) {
    console.error('Error adding business product:', error);
    throw error;
  }
};

// Update product (legacy function - use updateBusinessProduct instead)
export const updateProduct = async (productId, productData) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      ...productData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Update business product (new version with stock quantity and image support)
export const updateBusinessProduct = async (businessId, productId, productData) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      ...productData,
      businessId,
      updatedAt: new Date().toISOString()
    });
    return {
      id: productId,
      ...productData
    };
  } catch (error) {
    console.error('Error updating business product:', error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Delete business product (new version with business validation)
export const deleteBusinessProduct = async (businessId, productId) => {
  try {
    // First verify that the product belongs to this business
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      throw new Error('Product not found');
    }

    const productData = productDoc.data();
    if (productData.businessId !== businessId) {
      throw new Error('Unauthorized: Product does not belong to this business');
    }

    // Delete the product
    await deleteDoc(productRef);
    return true;
  } catch (error) {
    console.error('Error deleting business product:', error);
    throw error;
  }
};

// Get business products (used in BusinessProductsScreen.js)
export const getBusinessProducts = async (businessId) => {
  try {
    const productsQuery = query(
      collection(db, 'products'),
      where('businessId', '==', businessId)
    );
    const productsSnapshot = await getDocs(productsQuery);
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return products;
  } catch (error) {
    console.error('Error getting business products:', error);
    throw error;
  }
};

// Get products by business ID
export const getProductsByBusinessId = async (businessId) => {
  try {
    const productsQuery = query(
      collection(db, 'products'),
      where('businessId', '==', businessId)
    );
    const productsSnapshot = await getDocs(productsQuery);
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

// Get business details
export const getBusinessDetails = async (businessId) => {
  try {
    const businessDoc = await getDoc(doc(db, 'businesses', businessId));
    if (businessDoc.exists()) {
      return {
        id: businessDoc.id,
        ...businessDoc.data()
      };
    }
    throw new Error('Business not found');
  } catch (error) {
    console.error('Error getting business details:', error);
    throw error;
  }
};

// Update business location
export const updateBusinessLocation = async (businessId, location) => {
  try {
    const businessRef = doc(db, 'businesses', businessId);
    await updateDoc(businessRef, {
      location,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating business location:', error);
    throw error;
  }
};

// Get all businesses
export const getAllBusinesses = async () => {
  try {
    const businessesQuery = query(
      collection(db, 'businesses'),
      where('isApproved', '==', true)
    );
    const businessesSnapshot = await getDocs(businessesQuery);
    const businesses = businessesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return businesses;
  } catch (error) {
    console.error('Error getting all businesses:', error);
    throw error;
  }
};

// Search businesses by name or type
export const searchBusinesses = async (searchTerm) => {
  try {
    // Firebase doesn't support text search directly, 
    // so we fetch all approved businesses and filter them on the client side
    const businesses = await getAllBusinesses();
    
    return businesses.filter(business => 
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (business.type && business.type.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  } catch (error) {
    console.error('Error searching businesses:', error);
    throw error;
  }
};

// Register a new business
export const registerBusiness = async (businessName, description, imageUri, location, email, password) => {
  try {
    // Check if required fields are present
    if (!businessName || !description || !imageUri || !location || !email || !password) {
      throw new Error('All fields are required for business registration');
    }

    // Create user account first
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // For free tier: Just store the image URI for local development
    // In production: Would need alternative storage solution
    
    // Save business data to Firestore
    await setDoc(doc(db, 'businesses', user.uid), {
      name: businessName,
      description,
      imageUri: imageUri, // Store URI reference instead of uploaded URL
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isApproved: false,
      ownerId: user.uid,
      status: 'pending'
    });
    
    // Also create a user record for the business owner
    await setDoc(doc(db, 'users', user.uid), {
      name: businessName, // Using business name for now
      email,
      type: 'business',
      businessId: user.uid,
      createdAt: new Date().toISOString(),
      isBanned: false
    });
    
    return {
      success: true,
      userId: user.uid,
      businessId: user.uid
    };
  } catch (error) {
    console.error('Error registering business:', error);
    throw error;
  }
};
