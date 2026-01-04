# Stripe Integration Files for LaunchReady

## Files to Copy

Copy these files to your project:

```
components/UpgradeButton.tsx     → components/UpgradeButton.tsx
app/page.tsx                     → app/page.tsx (landing page)
app/signup/page.tsx              → app/signup/page.tsx
app/auth/callback/page.tsx       → app/auth/callback/page.tsx
```

## Environment Variables

Add these to Vercel (Settings → Environment Variables):

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | From Stripe Dashboard → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | From Stripe Dashboard → API Keys |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | From Stripe → Products → Your Pro product → Price ID |
| `STRIPE_WEBHOOK_SECRET` | From Stripe → Webhooks → Your endpoint → Signing secret |
| `NEXT_PUBLIC_APP_URL` | `https://launchready-ruby.vercel.app` |

## Stripe Setup

### 1. Create Product & Price

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Click **Add product**
3. Name: `LaunchReady Pro`
4. Price: `$30.00 USD` / month (recurring)
5. Save and copy the **Price ID** (starts with `price_`)

### 2. Set Up Webhook

1. Go to [Stripe → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. URL: `https://launchready-ruby.vercel.app/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (`whsec_...`)

## How It Works

1. **Landing Page**: Pro "Upgrade" button calls `/api/stripe/checkout`
   - If logged in → Redirects to Stripe Checkout
   - If not logged in → Redirects to `/signup?plan=pro`

2. **Signup Page**: Detects `?plan=pro` in URL
   - Shows "Pro Plan Selected" badge
   - After signup → Redirects to Stripe Checkout

3. **Auth Callback**: After email confirmation
   - If `?plan=pro` → Redirects to Stripe Checkout
   - Otherwise → Redirects to Dashboard

4. **Webhook**: Handles subscription events
   - `checkout.session.completed` → Sets user plan to 'pro'
   - `customer.subscription.deleted` → Sets user plan to 'free'

## Test Mode

Use Stripe test mode first:
- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any CVC

Switch to live mode when ready to accept real payments.
