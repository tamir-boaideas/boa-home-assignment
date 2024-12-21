import { useState } from 'react';
import {
  reactExtension,
  Banner,
  BlockStack,
  Button,
  Checkbox,
  Text,
  useApi,
  useCartLines,
} from "@shopify/ui-extensions-react/checkout";
import CryptoJS from "crypto-js";

export default reactExtension(
  "purchase.checkout.block.render",
  () => <Extension />
);

function Extension() {
  const api = useApi();
  const cartLines = useCartLines();
  const [selectedProducts, setSelectedProducts] = useState(new Set<string>());
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: string; message: string }>({ type: '', message: '' });

  const handleProductToggle = (variantId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(variantId)) {
        newSet.delete(variantId);
      } else {
        newSet.add(variantId);
      }
      return newSet;
    });
  };

  const generateSignature = (params: Record<string, string>, sharedSecret: string): string => {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('');
    
    console.log('Sorted params:', sortedParams);
    return CryptoJS.HmacSHA256(sortedParams, sharedSecret).toString();
  };

  const handleSaveCart = async () => {
    if (selectedProducts.size === 0) {
      setSaveStatus({
        type: 'error',
        message: 'Please select at least one product to save'
      });
      return;
    }

    setIsSaving(true);
    setSaveStatus({ type: '', message: '' });

    try {
      const queryParams = {
        timestamp: new Date().toISOString(),
        shop: 'home-assignment-113.myshopify.com'
      };

      const sharedSecret = 'fd8bd02ef3b2d45c5e79cc0b97f5a052';
      const signature = generateSignature(queryParams, sharedSecret);

      const queryString = new URLSearchParams({
        ...queryParams,
        signature
      }).toString();

      const apiUrl = `https://home-assignment-113.myshopify.com/apps/boa-home-task-bv/api/save-cart?${queryString}`;

      console.log('Making request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: Array.from(selectedProducts),
          checkoutToken: api.checkoutToken
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(errorText || `Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Save successful:', data);

      setSaveStatus({
        type: 'success',
        message: 'Your cart has been saved successfully!'
      });
      setSelectedProducts(new Set());
    } catch (error) {
      console.error('Save cart error:', error);
      setSaveStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save cart. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (cartLines.length === 0) {
    return (
      <BlockStack border="base" padding="base">
        <Text>No items in cart</Text>
      </BlockStack>
    );
  }

  return (
    <BlockStack border="base" padding="base" spacing="loose">
      <Text size="medium" emphasis="bold">Save Items for Later</Text>
      
      <BlockStack spacing="tight">
        {cartLines.map((line) => (
          <Checkbox
            key={line.merchandise.id}
            name={`save-${line.merchandise.id}`}
            checked={selectedProducts.has(line.merchandise.id)}
            onChange={() => handleProductToggle(line.merchandise.id)}
          >
            {line.merchandise.title}
          </Checkbox>
        ))}
      </BlockStack>

      {saveStatus.message && (
        <Banner
          status={saveStatus.type === 'error' ? 'critical' : 'success'}
        >
          {saveStatus.message}
        </Banner>
      )}

      <Button
        kind="secondary"
        onPress={handleSaveCart}
        loading={isSaving}
        disabled={isSaving || selectedProducts.size === 0}
      >
        Save Selected Items
      </Button>
    </BlockStack>
  );
}