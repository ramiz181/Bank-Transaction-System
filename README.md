# Banking Transaction System (Backend)

A **backend banking transaction system** built with **Node.js, Express,
and MongoDB** that simulates how real financial systems manage accounts,
authentication, and secure money transfers using **ledger-based
accounting**.

This project focuses on **backend architecture**, **transaction
safety**, and **data consistency**, rather than simple CRUD operations.

------------------------------------------------------------------------

# Project Overview

Modern financial systems do not simply store balances in a database.\
Instead, they use **immutable ledger entries** to derive account
balances.

This project demonstrates how a backend system can safely process
transactions using:

-   Ledger-based accounting
-   Transaction-safe database operations
-   Idempotent requests
-   Secure authentication (JWT + Session Control)

The system ensures **consistent and reliable money transfers** between
accounts.

------------------------------------------------------------------------

# Key Features

## User Authentication

-   User registration and login
-   Access Token + Refresh Token architecture
-   Token blacklist (secure logout)
-   Session expiration handling
-   HTTP-only cookies for secure storage

## Account Management

-   Each user can create a bank account
-   Accounts are linked to users

## Secure Transactions

Implements a **multi-step transfer flow** to ensure reliability.

Transaction flow includes:

1.  Request validation
2.  Idempotency key validation
3.  Account status validation
4.  Balance derivation from ledger
5.  Transaction creation (PENDING)
6.  Debit ledger entry
7.  Credit ledger entry
8.  Update transaction status
9.  Commit database transaction
10. Return response

------------------------------------------------------------------------

# Architecture Concepts Used

## Ledger-Based Accounting

Instead of storing balances directly, balances are **derived from ledger
entries**.

Balance Formula:
```js
Balance = Sum(Credits) - Sum(Debits)
```

This ensures:

-   Full transaction history
-   Auditability
-   Data integrity

## MongoDB Aggregation Pipeline

Account balances and transaction insights are computed using the MongoDB Aggregation Pipeline.

Example use cases:

-   Calculating real-time account balance
-   Summing debit and credit entries
-   Filtering and grouping transaction data

Example concept:

```js
accountSchema.methods.getBalance = async function () {
    const balanceData = await Ledger.aggregate([
        { $match: { account: this._id } },
        {
            $group: {
                _id: null,
                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ['$transactionType', 'DEBIT'] },
                            "$amount",
                            0
                        ],
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ['$transactionType', 'CREDIT'] },
                            '$amount',
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                balance: { $subtract: ['$totalCredit', '$totalDebit'] }
            }
        }
    ])
    if (balanceData.length == 0) {
        return 0
    }
    return balanceData[0].balance
}
```

This ensures:

-  Real-time balance computation
-  No redundant balance storage
-  High data consistency

## MongoDB Transactions

MongoDB sessions are used to ensure **atomic money transfers**.

Example:
```js
const session = await mongoose.startSession()
session.startTransaction()
```
This ensures that:

-   Either the entire transaction succeeds
-   Or everything rolls back

## Idempotency Keys

To prevent **duplicate transactions**, an idempotency key is used.

Example use case:

If a request is retried due to network failure, the same transaction
will **not be processed twice**.

------------------------------------------------------------------------
# Authentication Architecture

## Token Strategy

This system uses:

-   **Access Token (short-lived)** → authentication
-   **Refresh Token (long-lived)** → session continuity

## Login Flow

1.  User logs in
2.  Server generates:
    -   Access Token
    -   Refresh Token
3.  Refresh token is stored in database
4.  Tokens sent via **HTTP-only cookies**
5.  Session expiry is set

## Refresh Token Flow (Token Rotation)

    1. Verify refresh token
    2. Check if token exists in DB
    3. Check session expiration
    4. Remove old refresh token
    5. Issue new access + refresh token

### Key Security Features

-   **Token Rotation** → prevents reuse attacks
-   **Token Reuse Detection** → blocks stolen tokens

## Logout Flow (Token Blacklisting)

``` js
await TokenBlacklist.create({ token: accessToken })
```

-   Access token is **blacklisted**
-   Refresh token is **removed from DB**
-   Cookies are cleared

### Why Blacklist?

JWT is stateless → cannot be revoked normally

So we:

-   Store token in blacklist
-   Reject future requests using that token

## Session Expiration

``` js
user.sessionExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
```

Even if refresh token is valid, session can expire

If session is expired:

-   Tokens are cleared
-   User must login again

------------------------------------------------------------------------

# Tech Stack

## Backend

-   Node.js
-   Express.js

## Database

-   MongoDB
-   Mongoose

## Authentication

-   JWT (Access + Refresh Tokens)
-    Cookie-based authentication
-    Token blacklist system

## Other Tools

-   dotenv
-   Nodemailer
-   bcrypt

------------------------------------------------------------------------

# Future Improvements

-   Redis for token blacklist & idempotency
-   Transaction queue system
-   Fraud detection rules
-   Rate limiting
-   Audit logging
-   Distributed transaction handling

------------------------------------------------------------------------

# Author

Ramiz Malik\
Backend Developer \| MERN Stack Engineer

LinkedIn:\
https://www.linkedin.com/in/ramizwebdeveloper/
