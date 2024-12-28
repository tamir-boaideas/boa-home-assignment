# Shopify App Troubleshooting and Features README  

## Overview  
This document highlights the steps and efforts undertaken to resolve a persistent issue where API requests in the Shopify app were returning a 404 error, as well as the features successfully implemented as part of the assignment.  

## Successfully Implemented Features  

### Save and Retrieve Cart Feature  
This feature allows registered customers to save and retrieve their cart.  

#### For Logged-in Customers  
- Displays a section with text and a button enabling them to retrieve a saved cart.  
- Clicking the button triggers an API call via Shopify App Proxy to retrieve the saved cart and automatically add the products to the current cart using the Cart Ajax API.  

#### For Not Logged-in Customers  
- Displays a message informing customers they need to log in to use this feature.  

#### Customization Options  
The section supports the following customizations:  
1. Dynamic text content.  
2. Dynamic background color.  
3. Dynamic text color.  

### Shopify Checkout UI Extension  
A Shopify checkout UI extension was developed to enable customers to save their cart:  
- Displays a list of product titles in the cart, each accompanied by a checkbox.  
- Customers can select which products they want to save.  
- On submission, an API call is made to the backend to save the selected products to the database.  

### Database Structure  
The database table contains:  
- **Customer ID**: Identifies the customer who saved the cart.  
- **JSON Column**: Stores an array of product variant IDs. Each customer can have at most one saved cart at a time.  

## Steps Taken to Troubleshoot API Issue  

1. **Configured the Proxy API in Shopify Partner Dashboard**  
   - Ensured the proxy settings were correctly set up to route requests through Shopify's infrastructure.  
   - Verified the configuration multiple times to rule out any missteps.  

2. **Developed a Separate Test App**  
   - Built a standalone application to validate the SQL2 logic and isolate the problem outside the primary app.  
   - Successfully tested and ensured the logic works as intended.  

3. **Header Configuration Using Cloudflare**  
   - Adjusted and tested API request headers, ensuring compliance with Shopify's requirements.  
   - Utilized Cloudflare to debug potential issues with request handling and proxying.  

4. **In-depth Research on Shopify API**  
   - Studied Shopify’s official API documentation to understand the expected request formats and response handling.  
   - Watched tutorial videos and read troubleshooting guides to explore additional insights and potential solutions.  

## Current Status  
While I successfully implemented the cart-saving and retrieving functionality, I encountered a persistent 404 error when making API requests via the Shopify App Proxy. The issue is under investigation.  

## Next Steps  
- Continue debugging the API issue.  
- Seek further guidance from the Shopify developer community and forums.  
- **Understand the Root Cause**: I am eager to identify the root cause of the 404 error to enhance my problem-solving skills and avoid similar challenges in the future.  

## Acknowledgment  
This assignment has been a valuable learning experience, allowing me to gain hands-on experience with Shopify APIs, checkout UI extensions, and app development. I am committed to resolving the remaining issue and further improving my skills.  
