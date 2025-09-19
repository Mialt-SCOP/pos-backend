# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- `pnpm run start:dev` - Start in watch mode for development
- `pnpm run start:debug` - Start with debugger attached
- `pnpm run start:prod` - Run production build

### Testing
- `pnpm run test` - Run unit tests
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:cov` - Generate test coverage report
- `pnpm run test:e2e` - Run end-to-end tests

### Code Quality
- `pnpm run lint` - Lint and fix code issues
- `pnpm run format` - Format code with Prettier
- `pnpm run build` - Build the application

### Database Setup
- Start PostgreSQL: `docker-compose up -d`
- Database runs on port 5445 with credentials: user=pos, password=pos, database=pos

## Architecture Overview

### Core Structure
This is a NestJS backend application for a POS (Point of Sale) system using TypeScript, TypeORM for database management, and PostgreSQL as the database.

### Module Organization

#### Identity Module (`src/identity/`)
Handles authentication and authorization:
- **User Module**: User entity management with email/password authentication
- **Organization Module**: Multi-tenant organization structure with role-based membership (OrganizationMembers) and invitation system (OrganizationMemberInvitation)
- **Hasher Module**: Password hashing service using Argon2

#### Common Module (`src/common/`)
Shared services and utilities:
- **Mail Module**: Email service abstraction with Brevo provider implementation

#### Database Module (`src/db/`)
TypeORM configuration and database connection management. Uses environment-based configuration with Joi validation.

### Key Technical Details

- **Entity Relationships**: Organizations have many-to-many relationship with Users through OrganizationMembers
- **Role System**: Uses UserOrganizationRole enum for permission management
- **Database**: TypeORM with PostgreSQL, entities auto-loaded, synchronize disabled for production safety
- **Configuration**: Environment variables validated with Joi schema
- **API Documentation**: Uses NestJS Swagger and ReDoc for API documentation

### Environment Configuration
Required environment variables are validated through Joi schemas in:
- `TypeORMConfig.getConfigValidation()` - Database connection settings
- `IdentityConfig.getConfigValidation()` - Identity/auth configuration

### Testing Approach
- Jest configured for unit and e2e tests
- Test files use `.spec.ts` extension
- Coverage reports generated in `../coverage` directory