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
  useApi,
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

const APP_URL = "https://peas-sphere-manufacturing-expert.trycloudflare.com";

function Extension() {
  const cartLines = useCartLines();
  const customer = useCustomer();
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { shop } = useApi();

  console.log(shop, "shop");

  if (!customer && !customer?.id) {
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

    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    try {
      console.log("inside handleSave");
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`${APP_URL}/api/saved-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Shop-Domain": shop.myshopifyDomain,
        },
        body: JSON.stringify({
          products: selectedProducts,
          customerId: customer?.id,
          shop: shop.myshopifyDomain,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        console.log("inside response.ok");
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save cart");
      }

      setSuccessMessage("Cart saved successfully!");
      setSelectedProducts([]);
    } catch (err) {
      setError("Failed to save cart. Please try again later.");
      console.error("Save error:", err);
    } finally {
      console.log("inside finally");
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
      <InlineStack spacing="extraTight" blockAlignment="center">
        <Icon source="info" appearance="accent" />
        <Text emphasis="bold">Save your cart</Text>
      </InlineStack>

      {error && <Banner status="critical">{error}</Banner>}

      {successMessage && <Banner status="success">{successMessage}</Banner>}

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
