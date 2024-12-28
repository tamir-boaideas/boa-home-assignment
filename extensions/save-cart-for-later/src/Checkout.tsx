// src/extensions/Extension.tsx
import {
  reactExtension,
  Banner,
  BlockStack,
  Button,
  BlockSpacer,
  Form,
  Grid,
  View,
  Checkbox,
  Text,
  useApi,
} from "@shopify/ui-extensions-react/checkout";
import { CartLine } from "@shopify/ui-extensions/src/surfaces/checkout/api/standard/standard";
import { useState, useEffect } from "react";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

interface CartItem {
  id: string;
  title: string;
}

function Extension() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApi();

  const { shop } = api;
  const customerId = shop.id.split('/').pop();

  useEffect(() => {
    async function fetchCartItems() {
      setLoading(true);
      setError(null);

      try {
        const checkoutLines: CartLine[] = api.lines?.current || [];
        console.log(checkoutLines);
        const items = checkoutLines.map((line) => ({
          id: line.id,
          title: line.merchandise.title,
        }));

        setCartItems(items);

        const initialSelected: Record<string, boolean> = {};
        items.forEach((item) => (initialSelected[item.id] = false));
        setSelectedItems(initialSelected);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        setError("Failed to load cart items. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchCartItems();
  }, [api]);

  const handleCheckboxChange = (itemId: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const selectedProducts = cartItems.filter(
        (item) => selectedItems[item.id]
      );
      const CLOUDFLARE_API_URL =
        "https://meanwhile-carrying-artistic-ment.trycloudflare.com";

      const BASE_URL = CLOUDFLARE_API_URL || "https://localhost:3000";

      // const shopDomain = shop.myshopifyDomain;
      // const host = btoa(shopDomain);

      const response = await fetch(
        // `${BASE_URL}/apps/api/cart/save-cart?shop=${shopDomain}&host=${host}`,
        `${BASE_URL}/apps/api/cart/save-cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: customerId,
            items: selectedProducts,
          }),
        }
      );

      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to save cart");
      }

      const resetSelected: Record<string, boolean> = {};
      cartItems.forEach((item) => (resetSelected[item.id] = false));
      setSelectedItems(resetSelected);
    } catch (error) {
      console.error("Error saving cart:", error);
      setError("Failed to save cart. Please try again.");
    }
  };

  return (
    <BlockStack border="none" padding="base">
      {error && (
        <Banner status="critical" title="Error">
          <Text>{error}</Text>
        </Banner>
      )}
      <Banner title="Save your cart">
        {loading ? (
          <Text>Loading cart items...</Text>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Grid spacing="base" columns={["fill"]}>
              {cartItems.map((item) => (
                <View key={item.id}>
                  <Checkbox
                    checked={selectedItems[item.id]}
                    onChange={() => handleCheckboxChange(item.id)}
                  >
                    <Text>{item.title}</Text>
                  </Checkbox>
                </View>
              ))}
            </Grid>
            <BlockSpacer spacing="base" />
            <Button
              accessibilityRole="submit"
              kind="primary"
              onPress={handleSubmit}
            >
              Save
            </Button>
          </Form>
        )}
      </Banner>
    </BlockStack>
  );
}

