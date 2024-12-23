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
import { useState, useEffect } from "react";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { extension } = useApi();

  useEffect(() => {
    async function fetchCartItems() {
      setLoading(true);
      setError(null);
      try {
        const checkoutLines = [{
          id: "1",
          merchandise: {
            title: "Product 1",
          },
        }, {
          id: "2",
          merchandise: {
            title: "Product 2",
          },
        }]
        const items = checkoutLines.map(line => ({
          id: line.id,
          title: line.merchandise.title,
        }));

        setCartItems(items);

        const initialSelected = {};
        items.forEach(item => (initialSelected[item.id] = false));
        setSelectedItems(initialSelected);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        setError("Failed to load cart items. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchCartItems();
  }, [extension]);

  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const selectedProducts = cartItems.filter(item => selectedItems[item.id]);
      // const shop = extension.shop.domain;

      const response = await fetch(`/apps/save-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "X-Shopify-Shop-Domain": shop,
        },
        body: JSON.stringify({
          items: selectedProducts,
          // customerId: extension.customer?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save cart");
      }

      const resetSelected = {};
      cartItems.forEach(item => (resetSelected[item.id] = false));
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
