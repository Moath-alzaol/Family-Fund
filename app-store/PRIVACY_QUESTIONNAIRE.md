# App Privacy Answers

Select **Yes, we collect data from this app**.

These answers reflect the current code and Supabase schema. Recheck them if analytics, crash reporting, remote push tokens, advertising, payments, or other SDKs are added.

| Data type | Collected | Purpose | Linked to identity | Tracking |
| --- | --- | --- | --- | --- |
| Contact Info — Name | Yes | App Functionality | Yes | No |
| Identifiers — User ID | Yes | App Functionality | Yes | No |
| Financial Info — Other Financial Info | Yes | App Functionality | Yes | No |
| User Content — Other User Content | Yes | App Functionality | Yes | No |

Notes:

- “Other Financial Info” covers personal balances, monthly commitments, contributions, withdrawals, deposits, and family expenses.
- “Other User Content” covers request notes and beneficiary names.
- Do not select Payment Info: the app does not collect cards, bank accounts, or payment credentials.
- Do not select Purchases: the app records a private family ledger; it does not process App Store purchases or commerce.
- Do not select Device ID, Product Interaction, Diagnostics, Location, Contacts, Photos, or Advertising Data based on the current implementation.
- Data is not used for third-party advertising, developer advertising or marketing, analytics, or tracking.
- The app uses Supabase as a service provider for authentication and database hosting. The submitted answers must also remain consistent with the production Supabase configuration and logs actually retained.
