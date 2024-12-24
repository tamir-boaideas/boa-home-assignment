import axiosInstance from "../utils/axiosInstance";

export const saveCart = async (customerId: string, variantIds: string[]) => {
  try {
    const response = await axiosInstance.post("/apps/save-cart-proxy", {
      customerId,
      variantIds,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving cart:", error);
    throw error;
  }
};
