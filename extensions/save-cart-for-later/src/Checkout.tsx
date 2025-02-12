import {
  reactExtension,
  BlockStack,
  Button,
  Checkbox,
  Icon,
  Text,
  useCartLines,
  InlineStack,
  Banner,
  useCustomer,
} from "@shopify/ui-extensions-react/checkout";
import { useState } from "react";

interface SelectedProduct {
  id: string;
  quantity: number;
}

export default reactExtension(
  "purchase.checkout.payment-method-list.render-before",
  () => <Extension />
);

function Extension() {
  const cartLines = useCartLines();
  const customer = useCustomer();
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If customer is not logged in, show login prompt
  if (!customer && !customer?.email) {
    return (
      <BlockStack
        border="base"
        borderRadius="base"
        padding="base"
        spacing="loose"
        background="subdued"
      >
        <InlineStack spacing="extraTight" blockAlignment="center">
          <Icon source="info" appearance="accent" />
          <Text emphasis="bold">Save your cart</Text>
        </InlineStack>
        <Text>Please log in to save your cart for later.</Text>
      </BlockStack>
    );
  }

  const handleCheckboxChange = (
    productId: string,
    checked: boolean,
    quantity: number
  ) => {
    setSelectedProducts((prev) =>
      checked
        ? [...prev, { id: productId, quantity }]
        : prev.filter((product) => product.id !== productId)
    );

    // Clear any previous messages
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Save cart through App Proxy
      const response = await fetch("/apps/saved-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: selectedProducts,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save cart");
      }

      setSuccessMessage("Cart saved successfully!");
      setSelectedProducts([]); // Clear selections after successful save
    } catch (err) {
      setError("Failed to save cart. Please try again later.");
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BlockStack
      border="base"
      borderRadius="base"
      padding="base"
      spacing="loose"
      background="subdued"
    >
      {/* Header section with info icon and text inline */}
      <InlineStack spacing="extraTight" blockAlignment="center">
        <Icon source="info" appearance="accent" />
        <Text emphasis="bold">Save your cart</Text>
      </InlineStack>

      {/* Error message */}
      {error && <Banner status="critical">{error}</Banner>}

      {/* Success message */}
      {successMessage && <Banner status="success">{successMessage}</Banner>}

      {/* Products list section */}
      <BlockStack spacing="tight" inlineAlignment="start">
        {cartLines.map((line) => (
          <Checkbox
            key={line.id}
            id={line.merchandise.id}
            name={line.merchandise.id}
            checked={selectedProducts.some(
              (product) => product.id === line.merchandise.id
            )}
            onChange={(value) =>
              handleCheckboxChange(line.merchandise.id, value, line.quantity)
            }
          >
            {line.merchandise.title}
            {line.quantity > 1 ? ` (${line.quantity})` : ""}
          </Checkbox>
        ))}
      </BlockStack>

      {/* Save button section */}
      <BlockStack inlineAlignment="start">
        <Button
          kind="primary"
          onPress={handleSave}
          disabled={selectedProducts.length === 0 || isSaving}
          loading={isSaving}
        >
          Save
        </Button>
      </BlockStack>
    </BlockStack>
  );
}
