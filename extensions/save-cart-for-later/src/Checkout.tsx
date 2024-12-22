import { useCallback, useState } from "react";

import {
  reactExtension,
  Banner,
  BlockStack,
  Button,
  Checkbox,
  useApi,
  useCustomer
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const [productVariants, setProductVariants] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCartSaved, setIsCartSaved] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)

  const { sessionToken, shop, lines } = useApi();
  const { id: rawId } = useCustomer()

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setIsError(false)

    try {
      const token = await sessionToken.get();

      const customerId = extractId(rawId);

      const response = await fetch('/api/cart/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          { shop: shop.myshopifyDomain, productVariants, customerId }
        ),
      });

      if (!response.ok) {
        setIsError(true)
        return
      }

      setIsCartSaved(true)
    } catch (error) {
      console.error('Error saving cart:', error);
      setIsError(true)
    } finally {
      setIsSubmitting(false);
    }
  }, [rawId, shop.myshopifyDomain, productVariants]);

  const handleCheckboxChange = useCallback((gid, isChecked) => {
    const id = extractId(gid);

    setProductVariants(prev => isChecked ? [...prev, id] : prev.filter((selectedId) => selectedId !== id));
  }, [])

  const status = isError ? 'critical' : isCartSaved ? 'success' : 'info';

  return (
    <BlockStack border="dotted" padding="tight">
      <Banner title={titleStatus[status]} status={status} />

      {lines.current.map(({  merchandise: { title, id } }) => (
        <Checkbox
          key={id}
          id={id}
          name={title}
          onChange={(isChecked) => handleCheckboxChange(id, isChecked)}
          disabled={isSubmitting}
        >
          {title}
        </Checkbox>
      ))}

      <Button onPress={handleSubmit} disabled={isSubmitting} loading={isSubmitting}>
        Save Cart
      </Button>
    </BlockStack>
  );
}

const extractId = (gid: string) => gid.split('/').at(-1);

const titleStatus = {
  critical: 'Error saving cart',
  success: 'Cart saved',
  info: 'Save your cart',
};
