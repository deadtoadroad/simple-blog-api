# simple-blog-api

The beginnings of a simple blog API backed by a relational database (Postgres).

## Run

Edit the `.env` file to point to an instance of Postgres.
Alternatively a docker-compose file has been included to launch one.

```bash
docker-compose up -d # Optional
npm install
npm test
npm run prisma:migrate
npm run build
npm start
```

## Design

Some things included:

- Object-relational mapping (ORM)
- Database migrations
- Integration tests
  - Schema per test suite/worker to prevent data clashes
- Environments
- Safe storage of passwords
- Simple model validation

Some things not yet included which might be next steps:

- Authentication returning a JSON web token (JWT)
  - Login endpoint for email/password
  - Third-party authentication (OAuth)
- Authentication handlers
  - Check JWT signature
- Authorisation handlers
  - Check JWT roles
- Unit tests
  - Test individual handlers and mock data access
    - Perhaps implement the repository pattern for easier mocking
- Model validation
  - Use a validation library to centralise rules
  - Add validation handlers to validate and return errors consistently
- CORS
- Swagger/OpenAPI
- Emit and publish types for easier consumption by front-ends and other APIs
- Version the API
  - Emit and publish types per version
- Auditing
  - Basic (`createdBy`, `createdOn`, `updatedBy`, `updatedOn`)
  - Or perhaps an event store
    - Replay, checkpointing, CQRS, denormalised query database

Some future quality-of-life improvements:

- A release script to semantically version the API and generate changelogs based on commit messages
- Git hooks for linting commits and formatting code pre-commit
