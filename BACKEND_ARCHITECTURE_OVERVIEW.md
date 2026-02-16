# NESTAR Backend - Complete Architecture & Logic Overview

## Project Structure
Your backend is a **monorepo** built with **NestJS** containing two main applications:
- **nestar-api**: Main GraphQL API server (core application)
- **nestar-batch**: Batch processing service for scheduled tasks

---

## Technology Stack
| Layer | Technology |
|-------|-----------|
| **Framework** | NestJS 10.0.0 |
| **API Protocol** | GraphQL (Apollo Server 4.9.5) |
| **Database** | MongoDB with Mongoose ODM |
| **Real-time** | WebSocket (native WS) |
| **Authentication** | JWT with bcryptjs |
| **Language** | TypeScript |
| **File Upload** | GraphQL Upload (15MB max per file) |
| **Task Scheduling** | NestJS Schedule |

---

## Core Architecture

### 1. Application Entry Point (`main.ts`)
- Initializes NestJS application with Apollo GraphQL driver
- Enables **global validation** (class-validator)  
- Applies **global logging interceptor** for request/response tracking
- Enables **CORS** for cross-origin requests
- Configures **file upload** middleware (max 15MB, 10 files)
- Serves uploaded files from `/uploads` directory
- Activates **WebSocket adapter** for real-time communication
- Listens on port specified in `.env` (default: 3000)

### 2. Module Architecture (`AppModule`)
The application is organized into **8 modular components**:

```
AppModule
├── ConfigModule (Environment variables)
├── GraphQLModule (Apollo Server with auto schema generation)
├── DatabaseModule (MongoDB connection)
├── ComponentsModule
│   ├── MemberModule (User/Agent accounts)
│   ├── PropertyModule (Real estate listings)
│   ├── AuthModule (JWT authentication)
│   ├── CommentModule (Comments on properties/articles)
│   ├── LikeModule (Favorites/Likes system)
│   ├── ViewModule (View tracking)
│   ├── FollowModule (Follow relationships)
│   └── BoardArticleModule (Forum/Blog posts)
└── SocketModule (WebSocket real-time events)
```

### 3. Module Pattern
Each feature module follows this structure:
```
feature/
├── feature.module.ts (Imports all related services and resolvers)
├── feature.resolver.ts (GraphQL query/mutation handlers)
├── feature.service.ts (Business logic)
└── DTOs (Data Transfer Objects in libs/dto/)
```

---

## Database Models & Logic

### 1. Member Model (User/Agent System)
**Purpose**: User account management with role-based access control

**Key Fields**:
- **Role-based**: `memberType` (USER, AGENT, ADMIN)
- **Account Status**: `memberStatus` (ACTIVE, INACTIVE, SUSPENDED)
- **Authentication**: `memberAuthType` (PHONE, EMAIL, SOCIAL)
- **Security**: `memberPassword` (bcryptjs hashed, excluded from queries by default)
- **Profile**: nick, fullName, image, address, bio
- **Engagement Counters**: 
  - `memberProperties`: Count of properties owned
  - `memberArticles`: Count of articles written
  - `memberFollowers`/`memberFollowings`: Social metrics
  - `memberPoints`: Reputation/Points system
  - `memberLikes`: Total likes received
  - `memberViews`: Total profile views
  - `memberComments`: Total comments made
  - `memberRank`: Ranking position

**Relations**:
- Owns Properties
- Writes BoardArticles
- Creates Comments
- Follows/Followed by other Members
- Receives Likes & Views on profile

**Soft Delete**: `deletedAt` field for data retention

---

### 2. Property Model (Real Estate Listings)
**Purpose**: Real estate property marketplace listings

**Key Fields**:
- **Classification**: 
  - `propertyType` (HOUSE, APARTMENT, VILLA, COMMERCIAL, OFFICETEL, LAND, etc.)
  - `propertyStatus` (ACTIVE, SOLD, RENTED, INACTIVE)
  - `propertyLocation` (SEOUL, BUSAN, INCHEON, DAEGU, DAEJEON, GWANGJU, ULSAN, GYEONGGI, GANGWON, CHUNGBUK, CHUNGNAM, JEONBUK, JEONNAM, GYEONGBUK, GYEONGNAM, JEJU)
- **Listing Details**: 
  - `propertyAddress`: Full address
  - `propertyTitle`: Listing title
  - `propertyPrice`: Price in currency units
  - `propertySquare`: Square meters
  - `propertyBeds`: Number of bedrooms
  - `propertyRooms`: Total rooms
  - `propertyDesc`: Description
  - `propertyImages`: Array of image URLs
- **Engagement Metrics**:
  - `propertyViews`: View count
  - `propertyLikes`: Like count (favorites)
  - `propertyComments`: Comment count
  - `propertyRank`: Ranking/Scoring

**Relations**:
- Owned by Member (Agent)
- Has many Comments
- Receives Likes
- Tracked Views

**Business Logic**:
- Properties are ranked by engagement
- View/Like counters are incremented when users interact
- Comments count is aggregated from related comments

---

### 3. BoardArticle Model (Community Forum)
**Purpose**: User-generated discussion posts and blog articles

**Key Fields**:
- **Content**: 
  - `articleTitle`: Article title
  - `articleContent`: Markdown content
  - `articleImage`: Featured image URL
- **Classification**:
  - `articleCategory` (GENERAL, QUESTIONS, TIPS, NEWS, REVIEW, etc.)
  - `articleStatus` (ACTIVE, INACTIVE, DELETED)
- **Engagement**:
  - `articleLikes`: Like count
  - `articleViews`: View count
  - `articleComments`: Comment count
- **Author**: `memberId` (Reference to Member)

**Relations**:
- Written by Member
- Has many Comments
- Receives Likes

---

### 4. Comment Model
**Purpose**: Nested comments on Properties and BoardArticles

**Key Fields**:
- `commentGroup` (PROPERTY, ARTICLE) - Categorizes what's being commented on
- `commentStatus` (ACTIVE, INACTIVE, DELETED)
- `targetId`: Reference to commented entity (Property or Article)
- `parentId`: For nested replies (optional)
- `memberId`: Author reference

**Business Logic**:
- Support nested comments (replies to comments)
- Auto-increment parent article/property comment counter
- Soft delete support

---

### 5. Like Model (Favorites/Engagement)
**Purpose**: Tracks user likes/favorites on various entities

**Key Fields**:
- `likeGroup` (PROPERTY, ARTICLE, MEMBER, etc.) - Specifies what's being liked
- `targetId`: Reference to liked entity
- `memberId`: User who liked

**Business Logic**:
- Prevents duplicate likes (unique index on memberId + targetId + likeGroup)
- Increments like counter on target entity
- Used for favorite/bookmark functionality

---

### 6. View Model (Analytics)
**Purpose**: Tracks user profile and entity views

**Key Fields**:
- `viewGroup` (PROPERTY, MEMBER, ARTICLE) - Categorizes view type
- `targetId`: Reference to viewed entity
- `memberId`: User who viewed (optional for anonymous views)

**Business Logic**:
- Increments view counter on target entity
- Analytics and popularity tracking
- Can track anonymous or authenticated views

---

### 7. Follow Model (Social Graph)
**Purpose**: Follow relationships between Members

**Key Fields**:
- `followerId`: Member who is following
- `followingId`: Member being followed

**Business Logic**:
- Unidirectional relationships
- Increments follower/following counters on Members
- Foundation for social feed/notification system

---

### 8. Additional Models

**Notice Model**:
- System notifications and announcements
- Categories, statuses, and timestamps

**Notification Model**:
- User-specific notifications
- Types, statuses, and grouping

---

## Authentication & Security Flow

### Authentication Process:
1. **Registration**: 
   - User registers with phone number and password
   - Password hashed with bcryptjs (salt generated automatically)
   - `memberType` defaults to USER, `memberStatus` defaults to ACTIVE

2. **Login**:
   - Verify phone number and compare password with hash
   - On success, create JWT token with member payload
   - Password field explicitly excluded from token payload

3. **Protected Requests**:
   - Token sent in Authorization header
   - `AuthGuard` verifies JWT signature and expiration
   - `@AuthMember()` decorator injects authenticated member into resolver
   - `@Roles()` decorator enforces role-based access (USER/AGENT/ADMIN)

### Key Services:
- **AuthService**: 
  - `hashPassword()`: Generate bcryptjs hash
  - `comparePasswords()`: Verify password against hash
  - `createToken()`: Sign JWT with member payload
  - `verifyToken()`: Verify JWT and return member data

### Security Features:
- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- Unique indices on sensitive fields (phone, nick)
- Excluded password field from default queries (`select: false`)
- CORS enabled for trusted origins

---

## GraphQL API Design

### Core Concepts:
- **Resolver-based Architecture**: Each feature module has resolvers for queries and mutations
- **Auto Schema Generation**: `autoSchemaFile: true` generates GraphQL schema from TypeScript DTO classes
- **Type Safety**: Full TypeScript support with GraphQL types
- **Playground**: Enabled for development (accessible at `/graphql`)

### Error Handling:
- Centralized error formatter in GraphQLModule
- Custom error response format:
  ```json
  {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "User-friendly error message"
  }
  ```

### File Upload:
- Handled via `graphql-upload` middleware
- Max file size: 15MB per file
- Max files: 10 per request
- Uploaded files stored in `/uploads` directory
- Served as static files from `/uploads` route

### Typical Query Pattern:
```
Client → GraphQL Query/Mutation
  ↓
Resolver → Validates input with DTO
  ↓
Service → Executes business logic
  ↓
Database → Mongoose query to MongoDB
  ↓
Response → Formatted GraphQL JSON
  ↓
Middleware → Logging interceptor tracks request
  ↓
Client ← GraphQL response
```

---

## Real-time Communication (WebSockets)

### WebSocket Gateway (`SocketGateway`):
- Uses native WebSocket (WS) adapter (not Socket.IO)
- Configured at application level in `main.ts`

### Features:
- Connection tracking (counts active clients)
- Message subscriptions (`@SubscribeMessage('message')`)
- Lifecycle hooks: `afterInit`, `handleConnection`, `handleDisconnect`
- Logging for debugging

### Current Implementation:
- Basic echo message handler
- Ready to extend for real-time notifications
- Foundation for live updates, instant messaging, real-time collaboration

### Future Extensions:
- Real-time property updates (new listings, price changes)
- Live chat/direct messaging
- Instant notifications
- Real-time comment threads
- Activity feeds

---

## Supporting Infrastructure

### Libs Directory Structure
```
libs/
├── config.ts
│   └── Helper functions (MongoDB ObjectId conversion, etc.)
├── types/
│   └── common.ts - Utility types
├── enums/
│   ├── board-article.enum.ts (BoardArticleCategory, BoardArticleStatus)
│   ├── comment.enum.ts (CommentStatus, CommentGroup)
│   ├── common.enum.ts (Message, Direction)
│   ├── like.enum.ts (LikeGroup)
│   ├── member.enum.ts (MemberType, MemberStatus, MemberAuthType)
│   ├── notice.enum.ts (NoticeCategory, NoticeStatus)
│   ├── notification.enum.ts (NotificationType, NotificationStatus, NotificationGroup)
│   ├── property.enum.ts (PropertyType, PropertyStatus, PropertyLocation)
│   └── view.enum.ts (ViewGroup)
├── dto/
│   └── DTO classes for request validation and type safety
├── interceptor/
│   └── LoggingInterceptor - Logs all incoming requests and responses
└── schemas/
    └── Mongoose schema definitions
```

### Enum System
Type-safe constants used throughout the application:
- **MemberType**: USER, AGENT, ADMIN
- **PropertyType**: HOUSE, APARTMENT, VILLA, COMMERCIAL, OFFICETEL, etc.
- **PropertyStatus**: ACTIVE, SOLD, RENTED, INACTIVE
- **PropertyLocation**: All major Korean cities
- **CommentGroup/LikeGroup/ViewGroup**: Specify what entity is being interacted with
- **Status Enums**: ACTIVE, INACTIVE, SUSPENDED, DELETED for various entities

### Database Module
- Configures MongoDB connection via `MongooseModule`
- Supports both development and production databases (via `.env`)
- Connection string format: `mongodb+srv://...` for Atlas or `mongodb://localhost:27017/...` for local
- Logs connection status on startup
- Environment-aware: `MONGO_DEV` vs `MONGO_PROD`

### Logging Interceptor
- Global interceptor applied to all requests
- Logs request metadata:
  - Method, URL, status code
  - Request body
  - Response data
- Performance tracking capabilities
- Useful for debugging and monitoring

---

## Batch Processing Service (`nestar-batch`)

### Purpose:
- Independent service for scheduled/background operations
- Offload heavy or time-consuming tasks from main API

### Typical Use Cases:
- Scheduled data cleanup
- Batch aggregation of counters
- Periodic notifications
- Report generation
- Cache warming
- Database maintenance

### Architecture:
- Same modular structure as main API
- Uses NestJS Schedule for cron jobs
- Shares same MongoDB connection
- Can be deployed independently

### Startup Command:
```bash
npm run start:dev:batch  # Development mode
npm run start:prod:batch # Production mode
```

---

## Request Flow Examples

### Example 1: Property Listing Query
```
1. Client sends GraphQL query:
   query GetProperty($id: String!) {
     property(id: $id) {
       propertyTitle
       propertyPrice
       propertyImages
     }
   }

2. PropertyResolver receives request
3. PropertyService queries MongoDB via Mongoose
4. Database returns property document
5. Response formatted to match GraphQL schema
6. LoggingInterceptor logs the request/response
7. Client receives formatted JSON response
```

### Example 2: User Registration Mutation
```
1. Client sends GraphQL mutation:
   mutation Register($input: CreateMemberInput!) {
     createMember(input: $input) {
       _id
       memberNick
       token
     }
   }

2. MemberResolver validates input with DTO validation
3. AuthService hashes password with bcryptjs
4. MemberService creates document in MongoDB
5. AuthService generates JWT token
6. Response includes _id, nick, and token
7. Client stores token for future authenticated requests
```

### Example 3: Real-time WebSocket Message
```
1. Client connects to WebSocket
2. Server tracks connection (increments client counter)
3. Client sends message via socket
4. SocketGateway receives @SubscribeMessage('message')
5. Handler processes and returns response
6. Server broadcasts or sends back to client
7. Client disconnects → Server decrements counter
```

---

## File Upload Flow

### Upload Process:
```
1. Client sends file via GraphQL mutation with graphql-upload
2. Express middleware (graphqlUploadExpress) processes file
3. File size validated (max 15MB)
4. File count validated (max 10 files)
5. File stored in /uploads/[category]/ directory
   - /uploads/article/ - Article images
   - /uploads/member/ - Profile images
   - /uploads/property/ - Property images
6. Service saves file path in database
7. Client receives file URL for display
8. Files accessed via GET /uploads/[category]/[filename]
```

---

## Key Design Patterns

### 1. Modular Architecture
- Each feature is self-contained (module + resolver + service)
- Easy to maintain, test, and scale
- Clear separation of concerns

### 2. Dependency Injection
- NestJS DI container manages all service dependencies
- Services injected into resolvers/controllers
- Facilitates testing with mock services

### 3. Data Validation
- Class-validator with DTOs
- Validates all input before processing
- Type-safe request handling

### 4. Global Interceptors
- Logging applied uniformly across all requests
- Can add error handling, request tracing, etc.

### 5. Enum-based Classification
- Type-safe status and category fields
- Prevents invalid values in database
- Enables better querying and filtering

### 6. Soft Deletes
- `deletedAt` field instead of permanent deletion
- Data retention and recovery
- Audit trail capability

### 7. Counter Pattern
- Cached counts (followers, likes, comments, etc.)
- Better performance than aggregating each time
- Must be kept in sync with actual data

### 8. Guard-based Access Control
- Authentication guards validate requests
- Role guards enforce authorization
- Reusable across entire application

---

## Development Workflow

### Commands
```bash
# Development
npm run start:dev              # Watch mode for main API
npm run start:dev:batch        # Watch mode for batch service

# Production
npm run start:prod             # Start API (NODE_ENV=production)
npm run start:prod:batch       # Start batch service

# Build
npm run build                  # Compile TypeScript to JavaScript

# Code Quality
npm run format                 # Format code with Prettier
npm run lint                   # Lint and fix issues with ESLint

# Testing
npm test                       # Run unit tests
npm test:watch                 # Watch mode for tests
npm test:cov                   # Coverage report
npm test:e2e                   # End-to-end tests
```

### Development Environment Setup
```
1. Create .env file with:
   - MONGO_DEV: MongoDB connection string
   - PORT_API: API port (default 3000)
   - JWT_SECRET: Secret for JWT signing
   - NODE_ENV: 'development'

2. Run npm install to install dependencies

3. Start service with npm run start:dev

4. Access GraphQL Playground at http://localhost:3000/graphql
```

---

## Production Considerations

### Deployment Checklist
- [ ] Set `.env` variables for production database
- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting if needed
- [ ] Configure CORS origin for specific domains
- [ ] Set up MongoDB backups
- [ ] Configure JWT secret securely
- [ ] Enable HTTPS
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure proper logging
- [ ] Set file upload size limits appropriately

### Performance Optimizations
- ✅ Index critical fields (memberPhone, memberNick)
- ✅ Counter caching instead of aggregation
- ✅ Separate batch service for heavy operations
- ✅ GraphQL allows clients to request only needed fields
- Consider: Database query optimization, caching layer, request pagination

### Scalability Strategy
- Modular services can be scaled independently
- WebSocket ready for real-time features
- Batch service separable for horizontal scaling
- MongoDB Atlas for global distribution
- Load balancer for API instances

---

## Summary

**NESTAR** is a modern, well-architected real estate and social platform featuring:

- **Type-Safe**: Full TypeScript implementation with validation
- **Scalable**: Modular design, independent services
- **Real-time**: WebSocket support for live updates
- **Secure**: JWT authentication, role-based access, password hashing
- **Developer-Friendly**: GraphQL with auto-generated schema, clear structure
- **Production-Ready**: Environment configuration, error handling, logging

The combination of NestJS + GraphQL + MongoDB + WebSockets creates a robust foundation for a feature-rich, interactive application with excellent developer experience and maintainability.
