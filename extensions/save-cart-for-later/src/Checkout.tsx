import {
  reactExtension,
  Banner,
  BlockStack,
  Button,
  Checkbox,
  useApi,
  useCartLines,
  useCustomer,
  Text,
} from "@shopify/ui-extensions-react/checkout";
import { useState } from "react";

export default reactExtension("purchase.checkout.block.render", () => <Extension />);

function Extension() {
  const customer = useCustomer();
  const cartLines = useCartLines();
  const api = useApi();
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!customer?.id || !cartLines || cartLines.length === 0) {
    return null;
  }

  const handleCheckboxChange = (variantId: string) => {
    setError(null);
    setSelectedVariants((prev) =>
      prev.includes(variantId) 
        ? prev.filter((id) => id !== variantId) 
        : [...prev, variantId]
    );
  };

  const handleSave = async () => {
    if (selectedVariants.length === 0) return;
    setError(null);

    try {
      // First get current cart data
      const cartResponse = await fetch('/cart.js');
      const cart = await cartResponse.json();

      // Save selected items from cart
      const selectedItems = cart.items.filter(item => 
        selectedVariants.includes(item.variant_id)
      );

      const response = await fetch('/api/cart/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customer.id,
          variantIds: selectedVariants,
          cartData: selectedItems.map(item => ({
            variant_id: item.variant_id,
            quantity: item.quantity,
            properties: item.properties,
            selling_plan_allocation: item.selling_plan_allocation
          }))
        }),
      });

      if (!response.ok) throw new Error('Failed to save cart');

      // Clear selected items
      setSelectedVariants([]);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error saving cart:', error);
    }
  };

  return (
    <BlockStack spacing="loose">
      <Banner title="Save Cart for Later">
        <BlockStack spacing="tight">
          {error && <Text appearance="critical">{error}</Text>}
          {cartLines.map((line) => (
            <Checkbox
              key={line.merchandise.id}
              id={line.merchandise.id}
              name={line.merchandise.title}
              checked={selectedVariants.includes(line.merchandise.id)}
              onChange={() => handleCheckboxChange(line.merchandise.id)}
            >
              {line.merchandise.title}
            </Checkbox>
          ))}
          <Button
            onPress={handleSave}
            disabled={selectedVariants.length === 0}
          >
            Save ({selectedVariants.length} items)
          </Button>
        </BlockStack>
      </Banner>
    </BlockStack>
  );
}
