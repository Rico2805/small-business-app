// This service handles integration with MTN Mobile Money

// Note: In a production environment, you would integrate with the actual MTN Mobile Money API
// For testing purposes, we'll simulate the integration

// Simulated MTN Mobile Money API integration
export const initiateMomoPayment = async (phoneNumber, amount, orderId) => {
  try {
    // In a real implementation, this would call the MTN Mobile Money API
    // For now, we'll simulate the process
    
    console.log(`Initiating payment for ${amount} to phone ${phoneNumber} for order ${orderId}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return simulated payment reference
    const paymentReference = `MOMO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // For testing, we'll consider payments successful if the phone number starts with "677"
    const isSuccess = phoneNumber.startsWith('677');
    
    if (!isSuccess) {
      throw new Error('Payment failed. Please check your MTN Mobile Money number and try again.');
    }
    
    return {
      success: true,
      paymentReference,
      message: 'Payment initiated successfully'
    };
  } catch (error) {
    console.error('Error initiating MOMO payment:', error);
    throw error;
  }
};

// Check payment status
export const checkMomoPaymentStatus = async (paymentReference) => {
  try {
    // In a real implementation, this would call the MTN Mobile Money API
    // For now, we'll simulate the process
    
    console.log(`Checking payment status for reference: ${paymentReference}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For testing, we'll consider payments successful based on the reference
    const lastDigit = parseInt(paymentReference.slice(-1));
    
    // Simulate different states based on the last digit
    let status = 'PENDING';
    if (lastDigit % 10 < 8) {
      status = 'SUCCESSFUL';
    } else if (lastDigit % 10 < 9) {
      status = 'FAILED';
    }
    
    return {
      status,
      paymentReference,
      message: `Payment ${status.toLowerCase()}`
    };
  } catch (error) {
    console.error('Error checking MOMO payment status:', error);
    throw error;
  }
};

// Refund payment
export const refundMomoPayment = async (paymentReference, amount, reason) => {
  try {
    // In a real implementation, this would call the MTN Mobile Money API
    // For now, we'll simulate the process
    
    console.log(`Refunding payment ${paymentReference} for amount ${amount}. Reason: ${reason}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For testing, we'll consider refunds successful based on the reference
    const lastDigit = parseInt(paymentReference.slice(-1));
    const isSuccess = lastDigit % 10 < 9;
    
    if (!isSuccess) {
      throw new Error('Refund failed. Please try again later.');
    }
    
    return {
      success: true,
      refundReference: `REFUND-${paymentReference}`,
      message: 'Refund processed successfully'
    };
  } catch (error) {
    console.error('Error refunding MOMO payment:', error);
    throw error;
  }
};

// Validate MTN MOMO number
export const validateMomoNumber = (phoneNumber) => {
  // Basic validation for Cameroon MTN numbers
  // MTN Cameroon numbers typically start with 67, 65, or 68
  const isValid = /^(67|65|68)[0-9]{7}$/.test(phoneNumber);
  
  return {
    isValid,
    message: isValid ? 'Valid MTN MOMO number' : 'Invalid MTN MOMO number format'
  };
};

// Get payment methods
export const getAvailablePaymentMethods = () => {
  return [
    {
      id: 'mtn_momo',
      name: 'MTN Mobile Money',
      description: 'Pay using your MTN Mobile Money account',
      icon: 'mobile-phone'
    },
    {
      id: 'cash_delivery',
      name: 'Cash on Delivery',
      description: 'Pay in cash when your order is delivered',
      icon: 'money'
    },
    {
      id: 'custom_payment',
      name: 'Custom Payment',
      description: 'Discuss payment details with the seller',
      icon: 'comment'
    }
  ];
};
