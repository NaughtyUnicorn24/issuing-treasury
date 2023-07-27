import { encode } from "./jwt_encode_decode";
import stripe from "./stripe-loader";

export async function authenticateUser(email: any, password: any) {
  const { data: customers } = await stripe.customers.list({ email });
  const customer = customers[0];

  if (customer) {
    console.log("customer found");
    if (customer.metadata.accountId) {
      console.log("customer has account");
      // Check if there are missing requirements
      const account = await stripe.accounts.retrieve(
        customer.metadata.accountId,
      );
      let requiresOnboarding = false;
      // @ts-expect-error Remove after deployment succeeds
      if (account.requirements.currently_due.length > 1) {
        requiresOnboarding = true;
        console.log("customer requires more onboarding");
      }

      return {
        // @ts-expect-error Remove after deployment succeeds
        cookie: encode({
          accountId: customer.metadata.accountId,
          customerId: customer.id,
          customerName: customer.name,
          userEmail: account.email,
          isAuthenticated: true,
          requiresOnboarding: requiresOnboarding,
        }),
        requiresOnboarding: requiresOnboarding,
        accountId: customer.metadata.accountId,
      };
    }
  }

  return null;
}
