# CyBreach Module 4 — Pod Alpha Wallet Service

A secure, auditable, event-driven digital wallet service developed for **CyBreach Arena — Module 4: Engagement, Gamification & Credit Economy Platform**.

The Wallet Service provides the credit-economy foundation used by CyBreach modules for credit allocation, debit operations, subscriptions, expiry, reconciliation, transaction auditing, budget alerts, currency display, and cross-module wallet integration.

---

## Pod Alpha — Wallet Service

The Wallet Service is responsible for maintaining the authoritative tenant credit balance and append-only financial ledger for the CyBreach Arena platform.

Core design principles include:

- Double-entry ledger accounting
- Atomic wallet operations
- Idempotent debit and credit processing
- Append-only transaction history
- Tenant isolation
- JWT authentication
- Service API-key protection
- Automated reconciliation
- Credit expiration
- Subscription credit allocation
- Audit and CSV export
- Kafka/Redpanda event publishing
- Disaster-recovery procedures

---

## Architecture

```text
                    CyBreach Platform

        ┌──────────────┐
        │   Module 1   │
        │  Execution   │
        └──────┬───────┘
               │
        ┌──────────────┐
        │   Module 2   │
        │  Validation  │
        └──────┬───────┘
               │
        ┌──────────────┐
        │   Module 3   │
        │  Assurance   │
        └──────┬───────┘
               │
               ▼
     ┌────────────────────────┐
     │  Pod Alpha             │
     │  Wallet Service        │
     │                        │
     │  FastAPI               │
     │  Wallet Engine         │
     │  Idempotency           │
     │  Reconciliation        │
     │  Subscriptions         │
     │  Credit Expiry         │
     │  Audit / History       │
     │  Security              │
     └──────────┬─────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌───────────────┐  ┌───────────────┐
│  PostgreSQL   │  │   Redpanda    │
│               │  │    Kafka      │
│ Wallets       │  │               │
│ Transactions  │  │ Wallet Events │
│ Ledger        │  │ Notifications │
└───────────────┘  └───────────────┘
```

---

## Core Features

### Wallet Operations

- Credit/deposit operations
- Debit/withdraw operations
- Tenant wallet balance
- Transaction history
- Atomic database transactions
- Double-entry accounting
- Append-only ledger

### Idempotency & Replay Protection

Every protected wallet operation supports an idempotency key.

Duplicate requests using the same valid idempotency key return the original result rather than creating another financial transaction.

Cross-module idempotency conventions include:

```text
Module 1
mod1:{playbook_hash}:{tenant_id}:{run_id}

Module 2
mod2:{rule_hash}:{tenant_id}:{reval_id}

Module 3
mod3:{framework}:{tenant_id}:{report_id}

Module 4
mod4:{engagement_id}
```

### Reconciliation

The reconciliation subsystem verifies that wallet balances remain consistent with the ledger.

Capabilities include:

- Tenant reconciliation
- Global reconciliation
- Ledger balance verification
- Discrepancy detection
- Wallet pause handling
- Administrative reconciliation operations

### Credit Expiry

Credits support a 90-day expiry lifecycle.

The expiry workflow handles:

- Expired credit detection
- Remaining-credit calculation
- Expiry ledger operations
- Missing-wallet protection
- Zero-remaining-credit handling
- Insufficient-wallet-balance protection
- Expiry notifications

### Subscription Lifecycle

Subscription support includes:

- Signup
- Monthly credit allocation
- Renewal
- Cancellation
- Upgrade
- Downgrade
- Tier validation

Unused credits remain governed by the wallet credit-expiry lifecycle.

### Audit Trail

The Wallet Service provides transaction-history and audit functionality including:

- Tenant-scoped transaction history
- Date-range filtering
- Entry-type filtering
- Module-source filtering
- Pagination
- CSV ledger export
- Append-only integrity

### Multi-Currency Display

Internal ledger operations remain credit based.

The tenant-facing display layer supports conversion of credit values using configured currency rates without changing the underlying credit ledger.

### Budget Alerts

Tenants can configure balance thresholds.

When a wallet balance drops below its configured threshold, the service can generate a budget-alert notification through the notification/event infrastructure.

---

## Cross-Module Wallet Integration

The Wallet Service exposes the real debit path used by Modules 1, 2 and 3.

Typical integration flow:

```text
Module Operation
       │
       ▼
Generate Idempotency Key
       │
       ▼
POST /wallet/debit
       │
       ▼
Authentication + Authorization
       │
       ▼
Idempotency Validation
       │
       ▼
Balance Validation
       │
       ▼
Atomic Wallet Debit
       │
       ▼
Double-Entry Ledger
       │
       ▼
Transaction Result
```

Module debit costs are defined by the CyBreach Module 4 integration contract.

---

## Security

The Wallet Service includes security controls for sensitive wallet operations.

### Authentication

Protected APIs use JWT Bearer authentication.

JWT validation includes required claims such as:

- Subject
- Tenant ID
- Expiration

### Authorization

Tenant-scoped authorization prevents one tenant from accessing another tenant's wallet resources.

Administrative operations require administrative authorization.

### Service API Key

Sensitive service-to-service operations require an additional service API key.

This includes:

```text
POST /wallet/debit
POST /wallet/credit
```

### Replay Protection

Financial operations use persistent idempotency keys and deterministic request validation to prevent duplicate processing.

### SQL Injection Protection

Database operations use SQLAlchemy expressions and parameterized database operations rather than constructing wallet queries through untrusted SQL string concatenation.

---

## Double-Entry Ledger

Every financial transaction is represented by balanced ledger entries.

Example:

```text
Transaction: Module Usage Debit

MODULE_USAGE    CREDIT    25
WALLET          DEBIT     25
                           ──
Net                         0
```

Ledger records are append-only. Corrections are represented by additional offsetting entries rather than modifying historical ledger entries.

---

## Event Architecture

Wallet events are published through Kafka-compatible infrastructure using **Redpanda**.

The event layer supports wallet and notification workflows while keeping the authoritative financial state in PostgreSQL.

---

## Disaster Recovery

The project includes PostgreSQL disaster-recovery procedures and test infrastructure.

Recovery work includes:

- WAL archiving
- Point-in-time recovery procedures
- Primary/replica testing
- Streaming replication
- PostgreSQL primary failure simulation
- Replica promotion
- Ledger verification after promotion
- Balanced post-promotion writes

The DR validation demonstrates preservation of transactions confirmed on the replica before simulated primary failure.

---

## Performance Testing

The project includes Locust-based wallet stress testing.

Performance work covers:

- Multi-tenant load generation
- Debit/credit workloads
- Throughput measurement
- Latency measurement
- Idempotency collision testing
- Concurrent wallet operations

The Week 11 high-concurrency performance target remains documented separately where the required latency budget was not fully achieved under the largest stress workload.

---

## Technology Stack

| Component | Technology |
|---|---|
| Language | Python |
| API Framework | FastAPI |
| ORM | SQLAlchemy |
| Database | PostgreSQL 16 |
| Event Streaming | Redpanda / Kafka |
| Authentication | JWT |
| API Security | JWT + Service API Key |
| Testing | Pytest |
| Load Testing | Locust |
| Containers | Docker / Docker Compose |
| API Documentation | OpenAPI / Swagger UI |

---

## Project Structure

```text
app/
├── api/
│   └── v1/
├── core/
├── db/
├── events/
├── models/
├── repositories/
├── schemas/
├── services/
└── tasks/

tests/
├── contract/
├── integration/
├── security/
├── stress/
├── tasks/
└── unit/

docs/
week13-dr/

docker-compose.yml
docker-compose.week13-dr.yml
locustfile.py
requirements.txt
README.md
```

---

## Local Development

### Clone

```bash
git clone git@github-upretisuman776:upretisuman776/Wallet-Service.git
cd Wallet-Service
```

If you do not use the local SSH alias configured by the repository maintainer, clone using the normal GitHub URL for the repository instead.

### Create Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Environment Configuration

Create the local environment configuration required by the application.

Do not commit secrets, JWT signing keys, service API keys, passwords, or production credentials.

---

## Docker Environment

Start the development infrastructure:

```bash
docker compose up -d
```

Build and start the Wallet Service:

```bash
docker compose up -d --build wallet-service
```

Check containers:

```bash
docker compose ps
```

The standard development environment contains:

```text
wallet-service
wallet-postgres
wallet-redpanda
```

---

## Run the API Locally

With the virtual environment active:

```bash
uvicorn app.main:app --reload
```

Default local API:

```text
http://127.0.0.1:8000
```

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

OpenAPI specification:

```text
http://127.0.0.1:8000/openapi.json
```

---

## Main Wallet API

The service includes wallet endpoints for operations such as:

```text
POST /wallet/debit
POST /wallet/credit

GET  /wallet/balance/{tenant_id}
GET  /wallet/history/{tenant_id}
```

Additional routes support:

- Deposit and withdrawal workflows
- Transaction audit queries
- CSV export
- Subscription lifecycle operations
- Credit expiry
- Reconciliation
- Currency display
- Budget alerts

Swagger UI should be used as the current interactive API reference for the running application.

---

## Run Tests

Run the complete regression suite:

```bash
.venv/bin/pytest -q
```

The latest validated team baseline after the additional credit-expiry edge-case coverage completed with:

```text
122 passed
13 warnings
```

The warnings are known dependency/deprecation warnings and do not represent test failures.

Run individual test areas when required:

```bash
.venv/bin/pytest tests/unit -q
.venv/bin/pytest tests/integration -q
.venv/bin/pytest tests/contract -q
.venv/bin/pytest tests/security -q
.venv/bin/pytest tests/tasks -q
```

---

## Credit Expiry Edge-Case Coverage

Additional regression coverage verifies that the expiry workflow safely handles:

- Missing wallets
- Credits with no remaining amount
- Expiring credit greater than the available wallet balance

These conditions are tested without changing the production wallet implementation.

---

## Development Timeline

The Pod Alpha Wallet Service was developed incrementally across the CyBreach Module 4 implementation schedule.

Major completed areas include:

```text
Core wallet and ledger
Idempotency
Reconciliation
Credit expiry
Subscription integration
Audit trail and CSV export
Currency display
Budget alerts
Stress testing
Disaster recovery / PITR
Module 1/2/3 integration validation
Security audit
JWT and tenant authorization
Service API-key protection
Replica promotion drill
Final regression QA
```

---

## Team

### Pod Alpha — Wallet Service

| Team Member | Role |
|---|---|
| Suman Upreti | Core Backend / Wallet Service Lead |
| Pushkar Naraula | Wallet Features Support |
| Shivam Arora | Audit & API Testing Support |
| Ankit Maitra | Infrastructure & Documentation Support |

### Contribution Policy

The repository uses individual branches, commits, and pull requests for team contributions.

Each contributor should:

1. Work from their own GitHub identity.
2. Create a dedicated branch.
3. Implement and test their assigned work.
4. Commit using their own Git identity.
5. Push the branch.
6. Open a Pull Request.
7. Have the change reviewed before merging into `main`.

Assigned roles describe team responsibilities. Git history and merged pull requests remain the authoritative record of completed individual contributions.

---

## Repository

GitHub organization/account:

```text
upretisuman776
```

Repository:

```text
Wallet-Service
```

---

## Project Status

**Pod Alpha Wallet Service — Weeks 1–13 implementation complete.**

Current validated regression baseline:

```text
122 passed
13 warnings
0 failures
```

The Week 11 high-concurrency latency target remains documented as an open performance limitation rather than being represented as passed.

---

## License / Usage

This repository was developed as part of the **CyBreach Module 4 — Arena** project and associated technical/internship work.

Any deployment outside the development or assessment environment should use production-grade secret management, key rotation, monitoring, database backup policies, and high-availability infrastructure.
