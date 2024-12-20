import {
  reactExtension,
  BlockStack,
  Checkbox,
  Button,
  Text,
  Banner,
  useCartLines,
  useApi,
  useStorage,
} from '@shopify/ui-extensions-react/checkout';
import { useState } from 'react';
import CryptoJS from 'crypto-js';

export default reactExtension('purchase.checkout.block.render', () => <Extension />);

function Extension() {
  const cartLines = useCartLines();
  const api = useApi();
  const storage = useStorage();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'info' | 'success' | 'warning' | 'critical', 
    content: string
  } | null>(null);

  const handleCheckboxChange = (variantId: string) => {
    setSelectedItems(prev => 
      prev.includes(variantId) 
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    );
  };

  const generateSignature = (queryParams) => {
    // Remove the 'signature' parameter from the query parameters
    const { signature, ...params } = queryParams;
    const sharedSecret = "c683790c4e6a28bc2661631a40b73587";
  
    // Sort the parameters alphabetically by key
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('');
  
    // Generate the HMAC SHA-256 signature
    const calculatedSignature = CryptoJS.HmacSHA256(sortedParams, sharedSecret).toString(CryptoJS.enc.Hex);
  
    return calculatedSignature;
  };

  const getQueryParams = () => {
    const queryString = window.location.search;
    return Object.fromEntries(new URLSearchParams(queryString));
  };
  

  const handleSave = async () => {
    if (selectedItems.length === 0) return;
    
    setIsSaving(true);
    setMessage(null);

    try {
      const token = await api.sessionToken.get();
      const queryParams = getQueryParams();
      const signature = generateSignature(queryParams);
      const fullUrl = 'https://home-assignment-113.myshopify.com/apps/boa-home-task-bv';

      const fullUrlWithSignature = `${fullUrl}?signature=${signature}`;

      // Use a hardcoded URL based on your Shopify app configuration

      const selectedProducts = cartLines
        .filter(line => selectedItems.includes(line.merchandise.id))
        .map(line => ({
          variantId: line.merchandise.id,
          quantity: line.quantity
        }));

      console.log('Saving products:', selectedProducts);

      const response = await fetch(fullUrlWithSignature, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: selectedProducts,
          timestamp: new Date().toISOString(),
          signature: signature
        })
      });

      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
        throw new Error(`Failed to save cart: ${responseText}`);
      }

      // Optionally save to local storage as backup
      await storage.write('savedCart', JSON.stringify({
        items: selectedProducts,
        timestamp: new Date().toISOString()
      }));

      setMessage({
        type: 'success',
        content: `Saved ${selectedProducts.length} items for later`
      });

      // Clear selections after successful save
      setSelectedItems([]);
    } catch (error) {
      console.error('Save cart error:', error);
      setMessage({
        type: 'critical',
        content: error instanceof Error ? error.message : 'Failed to save cart. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (cartLines.length === 0) {
    return (
      <BlockStack spacing="loose" padding="base">
        <Text>Your cart is empty. Add items to save for later.</Text>
      </BlockStack>
    );
  }

  return (
    <BlockStack border="base" padding="base" spacing="loose">
      <Text size="medium" emphasis="bold">Save Items for Later</Text>
      
      {message && (
        <Banner status={message.type}>
          {message.content}
        </Banner>
      )}
      
      <BlockStack spacing="tight">
        {cartLines.map((line) => (
          <Checkbox
            key={line.merchandise.id}
            name={`save-${line.merchandise.id}`}
            checked={selectedItems.includes(line.merchandise.id)}
            onChange={() => handleCheckboxChange(line.merchandise.id)}
            disabled={isSaving}
          >
            <Text>{line.merchandise.title}</Text>
          </Checkbox>
        ))}
      </BlockStack>

      <Button
        onPress={handleSave}
        disabled={isSaving || selectedItems.length === 0}
      >
        {isSaving ? 'Saving...' : `Save ${selectedItems.length} Selected Items`}
      </Button>
    </BlockStack>
  );
}