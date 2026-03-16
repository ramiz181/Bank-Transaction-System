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
-   Secure authentication

The system ensures **consistent and reliable money transfers** between
accounts.

------------------------------------------------------------------------

# Key Features

## User Authentication

-   User registration and login
-   JWT based authentication
-   Secure cookies for session handling

## Account Management

-   Each user can create a bank account
-   Accounts are linked to users

## Secure Transactions

Implements a **multi-step transfer flow** to ensure reliability.

Transaction flow includes:

1.  Request validation\
2.  Idempotency key validation\
3.  Account status validation\
4.  Balance derivation from ledger\
5.  Transaction creation (PENDING)\
6.  Debit ledger entry\
7.  Credit ledger entry\
8.  Update transaction status\
9.  Commit database transaction\
10. Return response

------------------------------------------------------------------------

# Architecture Concepts Used

## Ledger-Based Accounting

Instead of storing balances directly, balances are **derived from ledger
entries**.

Balance Formula:

Balance = Sum(Credits) - Sum(Debits)

This ensures:

-   Full transaction history
-   Auditability
-   Data integrity

------------------------------------------------------------------------

## MongoDB Transactions

MongoDB sessions are used to ensure **atomic money transfers**.

Example:

const session = await mongoose.startSession() session.startTransaction()

This ensures that:

-   Either the entire transaction succeeds
-   Or everything rolls back

------------------------------------------------------------------------

## Idempotency Keys

To prevent **duplicate transactions**, an idempotency key is used.

Example use case:

If a request is retried due to network failure, the same transaction
will **not be processed twice**.

------------------------------------------------------------------------

# Tech Stack

## Backend

-   Node.js
-   Express.js

## Database

-   MongoDB
-   Mongoose

## Authentication

-   JSON Web Tokens (JWT)
-   Cookie-based authentication

## Other Tools

-   dotenv
-   Nodemailer
-   bcrypt

------------------------------------------------------------------------

# Future Improvements

-   Redis based idempotency key storage
-   Transaction queue system
-   Webhooks for transaction events
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
