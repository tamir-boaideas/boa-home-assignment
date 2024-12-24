import {
  reactExtension,
  useCartLines,
  Checkbox,
  Button,
  BlockStack,
  TextBlock,
  Icon,
} from "@shopify/ui-extensions-react/checkout";
import { useState, useEffect } from "react";

// Interface to type the response from the save cart endpoint.
// Ensures consistent structure when working with API responses.
interface SaveCartResponse {
  success: boolean;
  message: string;
}

/**
 * Function to save the cart for the customer by sending selected variant IDs to the backend.
 * 
 * @param customerId - The ID of the customer for whom the cart is being saved.
 * @param variantIds - Array of selected variant IDs to be saved.
 * @returns A Promise resolving to the server's response.
 * 
 * Throws an error if the request fails to ensure the caller handles failures appropriately.
 */
async function saveCart(
  customerId: string, 
  variantIds: string[]
): Promise<SaveCartResponse> {
  const response = await fetch("/apps/shopify/save-cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId,
      variantIds,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save cart"); // Provide clear error feedback for debugging.
  }

  return response.json();
}

// Main export of the component, registering it as a Shopify checkout extension.
export default reactExtension("purchase.checkout.block.render", () => (
  <SaveCartExtension />
));

/**
 * The main extension component rendering the "Save Cart" functionality.
 * Uses Shopify checkout extension APIs and React state/hooks for interactivity.
 */
function SaveCartExtension() {
  // Retrieve current cart lines from the Shopify checkout API.
  const lines = useCartLines();

  // State to manage selected variants, user messages, and the customer ID.
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  /**
   * Effect hook to fetch the customer ID when the component mounts or the `customerId` state is null.
   */
/*   useEffect(() => {
    const fetchCustomerId = async () => {
      try {
        const response = await fetch("/apps/shopify/customer-info", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch customer info");

        const data = await response.json();
        setCustomerId(data.customerId); // Update the state with the retrieved customer ID.
      } catch (error) {
        console.error("Error fetching customer info:", error); // Log errors for debugging.
        setMessage("Failed to fetch customer information."); // Provide user-friendly feedback.
      }
    };

    if (!customerId) {
      fetchCustomerId();
    }
  }, [customerId]);
 */
  /**

  
   * Handler to manage the state of selected variants when checkboxes are toggled.
   * 
   * @param variantId - The ID of the variant being selected or deselected.
   * @param checked - Whether the checkbox is checked or unchecked.
   */
  const handleCheckboxChange = (variantId: string, checked: boolean) => {
    setSelectedVariants((prev) =>
      checked ? [...prev, variantId] : prev.filter((id) => id !== variantId)
    );
  };

  /**
   * Handler for the "Save" button click event. It triggers the save cart API call.
   */
  const handleSaveCart = async () => {
    try {
      if (!customerId) {
        setMessage("Customer ID is not available.");
        return;
      }

      const response = await saveCart(customerId, selectedVariants);
      setMessage("Cart saved successfully!");
      console.log("Response data:", response); // Log response for debugging during development.
    } catch (error) {
      console.error("Error saving cart:", error);
      setMessage("Error saving cart. Please try again."); // User-friendly error message.
    }
  };

  // UI rendering starts here.
  return (
    <BlockStack
      spacing="loose"
      padding="base"
      borderRadius="base"
      background="subdued" // Subdued background ensures focus remains on the content.
    >
      {/* Header Section */}
      <BlockStack spacing="none">
        <BlockStack spacing="extraTight" inlineAlignment="start">
          <Icon 
            source="info" 
            appearance="accent" // Icon provides visual feedback.
          />
          <TextBlock size="medium" emphasis="bold">
            Save your cart
          </TextBlock>
        </BlockStack>
      </BlockStack>

      {/* Dynamic List of Cart Items */}
      <BlockStack spacing="tight">
        {lines.map((line) => {
          const variantId = line.merchandise.id; // Unique identifier for the variant.
          const title = line.merchandise.title; // Display title for the merchandise.

          return (
            <Checkbox
              key={variantId} // Unique key ensures React efficiently updates the list.
              checked={selectedVariants.includes(variantId)} // Checkbox reflects selection state.
              onChange={(checked) => handleCheckboxChange(variantId, checked)}
            >
              {title}
            </Checkbox>
          );
        })}
      </BlockStack>

      {/* Save Button */}
      <Button
        kind="primary"
        onPress={handleSaveCart}
        accessibilityLabel="Save selected items" // Improves accessibility for screen readers.
      >
        Save
      </Button>

      {/* Feedback Message */}
      {message && (
        <TextBlock appearance="success" emphasis="bold">
          {message}
        </TextBlock>
      )}
    </BlockStack>
  );
}
