# NESTAR Backend API Documentation

## Project Overview

**NESTAR** is a full-stack real estate and social platform built with **NestJS**, **GraphQL**, **MongoDB**, and **WebSockets**. It's a monorepo containing multiple applications:
- **nestar-api**: Main GraphQL API server
- **nestar-batch**: Batch processing service

### Tech Stack
- **Framework**: NestJS 10.0.0 (Node.js framework)
- **API Protocol**: GraphQL (Apollo Server 4.9.5)
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: WebSocket (Socket.IO)
- **Authentication**: JWT
- **Language**: TypeScript
- **Additional**: GraphQL Upload for file handling, Scheduled tasks

---

## Database Models (Schemas)

### 1. **Member Model**
The user/agent account system with role-based access control.

**Fields:**
- `memberType`: Enum (USER, AGENT, ADMIN) - Role of the user
- `memberStatus`: Enum (ACTIVE, INACTIVE, SUSPENDED) - Account status
- `memberAuthType`: Enum (PHONE, EMAIL, SOCIAL) - Authentication method
- `memberPhone`: String (unique) - Phone number for login
- `memberNick`: String (unique) - Display nickname
- `memberPassword`: String (hashed) - Password (not selected by default)
- `memberFullName`: String - Full name
- `memberImage`: String - Profile image URL
- `memberAddress`: String - Address
- `memberDesc`: String - Bio/description
- `memberProperties`: Number - Count of properties owned
- `memberArticles`: Number - Count of articles written
- `memberFollowers`: Number - Number of followers
- `memberFollowings`: Number - Number of people following
- `memberPoints`: Number - Reputation/Points
- `memberLikes`: Number - Total likes received
- `memberViews`: Number - Total profile views
- `memberComments`: Number - Total comments made
- `memberRank`: Number - Ranking position
- `memberWarnings`: Number - Warning count
- `memberBlocks`: Number - Block count
- `deletedAt`: Date - Soft delete timestamp
- `timestamps`: Auto-generated (createdAt, updatedAt)

**Relations**: Has many Properties, BoardArticles, Comments, Follows, Likes

---

### 2. **Property Model**
Real estate property listings.

**Fields:**
- `propertyType`: Enum (HOUSE, APARTMENT, VILLA, COMMERCIAL, etc.) - Property type
- `propertyStatus`: Enum (ACTIVE, SOLD, RENTED, INACTIVE) - Listing status
- `propertyLocation`: Enum (SEOUL, BUSAN, INCHEON, etc.) - Geographic location
- `propertyAddress`: String - Full address
- `propertyTitle`: String - Listing title
- `propertyPrice`: Number - Price in currency units
- `propertySquare`: Number - Square meters
- `propertyBeds`: Number - Number of bedrooms
- `propertyRooms`: Number - Total rooms
- `propertyViews`: Number - View count
- `propertyLikes`: Number - Like count (favorites)
- `propertyComments`: Number - Comment count
- `propertyRank`: Number - Ranking score
- `propertyImages`: Array[String] - Image URLs
- `propertyDesc`: String - Description
- `memberId`: ObjectId - Reference to property owner (Agent)
- `timestamps`: Auto-generated

**Relations**: Owned by Member, Has many Comments, Likes, and Views

---

### 3. **BoardArticle Model**
Community discussion forum/blog posts.

**Fields:**
- `articleCategory`: Enum (GENERAL, QUESTIONS, TIPS, NEWS, etc.) - Category type
- `articleStatus`: Enum (ACTIVE, INACTIVE, DELETED) - Post status
- `articleTitle`: String - Article title
- `articleContent`: String - Article body/markdown content
- `articleImage`: String - Featured image URL
- `articleLikes`: Number - Like count
- `articleViews`: Number - View count
- `articleComments`: Number - Comment count
- `memberId`: ObjectId - Reference to author
- `timestamps`: Auto-generated

**Relations**: Written by Member, Has many Comments and Likes

---

### 4. **Comment Model**
Nested comments on properties and board articles.

**Fields:**
- `commentRefId`: ObjectId - Reference to parent (Property or BoardArticle)
- `commentType`: Enum (PROPERTY, ARTICLE) - What it's commenting on
- `commentContent`: String - Comment text
- `commentLikes`: Number - Like count
- `memberId`: ObjectId - Comment author
- `parentCommentId`: ObjectId (optional) - Parent for nested comments
- `timestamps`: Auto-generated

**Relations**: References Property or BoardArticle, Written by Member

---

### 5. **Follow Model**
Member subscription/following relationships.

**Fields:**
- `followerId`: ObjectId - User doing the following
- `followingId`: ObjectId - User being followed
- `timestamps`: Auto-generated

**Relations**: Many-to-many relationship between Members

---

### 6. **Like Model**
Tracking likes/favorites on properties, articles, and comments.

**Fields:**
- `likeRefId`: ObjectId - Reference to liked item
- `likeType`: Enum (PROPERTY, ARTICLE, COMMENT) - Type of item liked
- `memberId`: ObjectId - User who liked
- `timestamps`: Auto-generated

**Relations**: References Property, BoardArticle, or Comment; associated with Member

---

### 7. **View Model**
Tracking property views/visits.

**Fields:**
- `viewRefId`: ObjectId - Reference to property viewed
- `memberId`: ObjectId - User who viewed
- `timestamps`: Auto-generated

**Relations**: References Property, associated with Member

---

### 8. **Notice Model**
Admin notifications/announcements to users.

**Fields:**
- `noticeTitle`: String
- `noticeContent`: String
- `noticeType`: Enum - Notice category
- `timestamps`: Auto-generated

---

### 9. **Notification Model**
User notifications (follows, likes, comments).

**Fields:**
- `notificationTarget`: ObjectId - User receiving notification
- `notificationType`: Enum (FOLLOW, LIKE, COMMENT) - Event type
- `notificationRefId`: ObjectId - Reference to triggering item
- `isRead`: Boolean - Read status
- `timestamps`: Auto-generated

---

## GraphQL API Endpoints

### **Member Module** - Authentication & User Management

#### Mutations (Write Operations):
```
signup(input: MemberInput!): Member
```
- Public endpoint for user registration
- Creates new user account with phone/nick

```
login(input: LoginInput!): Member
```
- Public endpoint for authentication
- Returns JWT token and member data

```
updateMember(input: MemberUpdate!): Member
```
- Authenticated (AuthGuard)
- Updates current user's profile
- Can update: nickname, fullName, address, description, image

```
likeTargetMember(memberId: String!): Member
```
- Authenticated
- Add user to favorites/liked members
- Updates member's memberLikes counter

```
updateMemberByAdmin(input: MemberUpdate!): Member
```
- Admin only (ADMIN role + RolesGuard)
- Update any user's profile and settings

```
imageUploader(file: Upload!, target: String!): String
```
- Authenticated
- Uploads single image to specified target folder
- Returns image path
- Validates MIME types

```
imagesUploader(files: [Upload!]!, target: String!): [String]
```
- Authenticated
- Uploads multiple images
- Returns array of image paths

#### Queries (Read Operations):
```
checkAuth: String
```
- Authenticated
- Verify JWT token validity
- Returns greeting with user nickname

```
checkAuthRoles: String
```
- Authenticated with role check (USER, AGENT)
- Verify role and permissions

```
getMember(memberId: String!): Member
```
- Can be called by authenticated or guest users (WithoutGuard)
- Get specific user's profile
- Includes member stats (followers, properties, articles)

```
getAgents(input: AgentsInquiry!): Members
```
- Can be called by authenticated or guest (WithoutGuard)
- List all real estate agents
- Supports pagination and filtering
- Input includes page, limit, search criteria

```
getAllMembersByAdmin(input: MembersInquiry!): Members
```
- Admin only
- List all users with admin filters
- Pagination and status filtering

---

### **Property Module** - Real Estate Listings

#### Mutations:
```
createProperty(input: PropertyInput!): Property
```
- Agent only (AGENT role)
- Create new property listing
- Input: type, location, address, title, price, beds, rooms, images, description

```
updateProperty(input: PropertyUpdate!): Property
```
- Agent only
- Update own property listing
- Can only edit own properties

```
likeTargetProperty(propertyId: String!): Property
```
- Authenticated
- Add property to favorites
- Increments propertyLikes counter

```
updatePropertyByAdmin(input: PropertyUpdate!): Property
```
- Admin only
- Update any property

```
removePropertyByAdmin(propertyId: String!): Property
```
- Admin only
- Delete property (hard delete)

#### Queries:
```
getProperty(propertyId: String!): Property
```
- Can be called by authenticated or guest (WithoutGuard)
- Get property details
- Tracks property views

```
getProperties(input: PropertiesInquiry!): Properties
```
- Can be called by authenticated or guest
- List properties with filtering
- Filters: location, propertyType, priceRange, search
- Supports pagination and sorting

```
getFavorites(input: OrdinaryInquiry!): Properties
```
- Authenticated
- List current user's favorited properties
- Pagination support

```
getVisited(input: OrdinaryInquiry!): Properties
```
- Authenticated
- List properties the user has viewed
- Sorted by most recent

```
getAgentProperties(input: AgentPropertiesInquiry!): Properties
```
- Agent only
- List current agent's properties
- Supports filtering by status

```
getAllPropertiesByAdmin(input: AllPropertiesInquiry!): Properties
```
- Admin only
- List all properties across all agents
- Advanced filtering

---

### **BoardArticle Module** - Community Forum/Blog

#### Mutations:
```
createBoardArticle(input: BoardArticleInput!): BoardArticle
```
- Authenticated
- Create new community post
- Input: category, title, content, image

```
updateBoardArticle(input: BoardArticleUpdate!): BoardArticle
```
- Authenticated
- Update own article
- Owner verification

```
likeTargetBoardArticle(articleId: String!): BoardArticle
```
- Authenticated
- Like/favorite an article
- Increments articleLikes

```
updateBoardArticleByAdmin(input: BoardArticleUpdate!): BoardArticle
```
- Admin only
- Update any article

```
removeBoardArticleByAdmin(articleId: String!): BoardArticle
```
- Admin only
- Delete article

#### Queries:
```
getBoardArticle(articleId: String!): BoardArticle
```
- Can be called by authenticated or guest
- Get article with comments count

```
getBoardArticles(input: BoardArticlesInquiry!): BoardArticles
```
- Can be called by authenticated or guest
- List articles with pagination
- Filters by category, search term
- Sorted by date or popularity

```
getAllBoardArticlesByAdmin(input: AllBoardArticlesInquiry!): BoardArticles
```
- Admin only
- List all articles with admin filters
- Can see inactive/deleted articles

---

### **Comment Module** - Nested Comments

#### Mutations:
```
createComment(input: CommentInput!): Comment
```
- Authenticated
- Create comment on property or article
- Input: commentRefId, commentType, content

```
updateComment(input: CommentUpdate!): Comment
```
- Authenticated
- Update own comment
- Owner verification

```
removeCommentByAdmin(commentId: String!): Comment
```
- Admin only
- Delete inappropriate comments

#### Queries:
```
getComments(input: CommentsInquiry!): Comments
```
- Can be called by authenticated or guest
- Get all comments for a property/article
- Pagination support
- Supports nested comment threads

---

### **Follow Module** - Member Subscriptions

#### Mutations:
```
subscribe(input: String!): Follower
```
- Authenticated
- Follow another member
- Input: memberId to follow

```
unsubscribe(input: String!): Follower
```
- Authenticated
- Unfollow a member
- Input: memberId to unfollow

#### Queries:
```
getMemberFollowings(input: FollowInquiry!): Followings
```
- Can be called by authenticated or guest
- Get list of people a member follows
- Pagination support
- Input: memberId of target user

```
getMemberFollowers(input: FollowInquiry!): Followers
```
- Can be called by authenticated or guest
- Get list of a member's followers
- Pagination support
- Input: memberId of target user

---

## Authentication & Authorization

### **Auth Guard (AuthGuard)**
- Verifies JWT token is valid and present
- Required for: mutations, user-specific queries
- Extracts and validates JWT from request headers
- Throws error if token invalid or expired

### **Without Guard (WithoutGuard)**
- Optional authentication
- Works for both authenticated and guest users
- Used for public content (property listings, articles)
- Allows analytics: tracking views from anonymous users

### **Roles Guard (RolesGuard)**
- Role-based access control (RBAC)
- Combined with @Roles decorator
- Validates user has required role (USER, AGENT, ADMIN)
- Prevents unauthorized access to admin/agent features

### **Decorators:**
```typescript
@AuthMember() // Injects entire member object
@AuthMember('_id') // Injects specific field (memberId)
@AuthMember('memberNick') // Injects member nickname
@Roles(MemberType.ADMIN) // Specify allowed roles
```

---

## User Roles & Permissions

### **USER** (Regular Member)
- ✅ View properties and articles
- ✅ Create board articles and comments
- ✅ Follow other users
- ✅ Like properties and articles
- ❌ Cannot create property listings
- ❌ Cannot access admin features

### **AGENT** (Real Estate Agent)
- ✅ All USER permissions
- ✅ Create and manage property listings
- ✅ View own property statistics
- ✅ Access agent-specific queries
- ❌ Cannot access admin features

### **ADMIN** (Administrator)
- ✅ All permissions
- ✅ View all users, properties, articles
- ✅ Update/delete any content
- ✅ Remove inappropriate comments
- ✅ User management and moderation
- ✅ System administration

---

## WebSocket (Real-time Features)

### **Socket.IO Integration**
- Located in: `socket/socket.gateway.ts`
- Real-time notifications
- Live property updates
- User activity notifications

### Events (likely):
- Property views (real-time update of view counts)
- New follow notifications
- New comment notifications
- Like notifications
- New article notifications

---

## File Upload System

### **Supported Features:**
- Single file upload: `imageUploader(file: Upload!, target: String!)`
- Multiple files upload: `imagesUploader(files: [Upload!]!, target: String!)`
- Target folders:
  - `uploads/member/` - User profile images
  - `uploads/property/` - Property listing images

### **Validation:**
- MIME type validation (allowed: image/jpeg, image/png, image/gif, etc.)
- File serialization with unique naming
- Stream-based upload (efficient for large files)

---

## Data Types & Enums

### **Member Enums:**
```typescript
MemberType: 'USER' | 'AGENT' | 'ADMIN'
MemberStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
MemberAuthType: 'PHONE' | 'EMAIL' | 'SOCIAL'
```

### **Property Enums:**
```typescript
PropertyType: 'HOUSE' | 'APARTMENT' | 'VILLA' | 'COMMERCIAL' | ... (20+ types)
PropertyStatus: 'ACTIVE' | 'SOLD' | 'RENTED' | 'INACTIVE'
PropertyLocation: 'SEOUL' | 'BUSAN' | 'INCHEON' | ... (major Korean cities)
```

### **Article Enums:**
```typescript
BoardArticleCategory: 'GENERAL' | 'QUESTIONS' | 'TIPS' | 'NEWS' | ...
BoardArticleStatus: 'ACTIVE' | 'INACTIVE' | 'DELETED'
```

### **Like & Comment Types:**
```typescript
LikeType: 'PROPERTY' | 'ARTICLE' | 'COMMENT'
CommentType: 'PROPERTY' | 'ARTICLE'
NotificationType: 'FOLLOW' | 'LIKE' | 'COMMENT'
```

---

## Common Features Across APIs

### **Pagination:**
```typescript
interface OrdinaryInquiry {
  page: number (1-based)
  limit: number (items per page)
}
```

### **Search & Filtering:**
```typescript
interface PropertiesInquiry {
  search: {
    location?: PropertyLocation
    propertyType?: PropertyType
    minPrice?: number
    maxPrice?: number
    keyword?: string
  }
  page: number
  limit: number
  sort?: 'newest' | 'popular' | 'likes'
}
```

### **Response Pagination:**
```typescript
interface Members {
  list: Member[]
  total: number
  page: number
  limit: number
  pages: number
}

// Similar structure for Properties, BoardArticles, Comments, Followers
```

---

## Error Handling

### **Global Error Handler:**
- GraphQL global formatError function
- Returns structured errors:
```typescript
{
  code: error.extensions.code
  message: error.extensions.response.message || error.message
}
```

### **Message Enums (from common.enum):**
- `UPLOAD_FAILED`
- `PROVIDE_ALLOWED_FORMAT`
- Standard error messages for validation failures

---

## Database Configuration

### **MongoDB:**
- Uses Mongoose ODM with NestJS MongooseModule
- Configured in: `database/database.module.ts`
- Connection URI from environment variables

### **Indexes:**
- Unique indexes on: memberPhone, memberNick, memberEmail
- Sparse indexes to allow null values for optional fields

---

## Batch Service

### **nestar-batch** Application:
- Separate Node.js service for scheduled tasks
- Located in: `apps/nestar-batch/`
- Likely handles:
  - Periodic data cleanup
  - Batch notifications
  - Report generation
  - Data aggregation tasks
- Uses NestJS Schedule decorator for task scheduling

---

## API Statistics & Counters

The system maintains denormalized counts for quick access:

**Per Member:**
- memberProperties (count of properties)
- memberArticles (count of articles)
- memberFollowers (follower count)
- memberFollowings (following count)
- memberLikes (likes received)
- memberViews (profile views)
- memberComments (comments made)
- memberPoints (reputation score)
- memberRank (ranking position)

**Per Property:**
- propertyViews (listing views)
- propertyLikes (favorites)
- propertyComments (comment count)
- propertyRank (ranking)

**Per Article:**
- articleViews (read count)
- articleLikes (favorites)
- articleComments (comment count)

These are automatically incremented when corresponding actions occur.

---

## Logging & Monitoring

### **Logging Interceptor:**
- Located in: `libs/interceptor/Logging.interceptor.ts`
- Logs all GraphQL mutations and queries
- Logs authentication attempts
- Error logging in console

### **GraphQL Playground:**
- Enabled in development
- Interactive API documentation and testing
- GraphQL schema auto-generation

---

## Project Structure Summary

```
apps/
  nestar-api/
    src/
      components/        # Feature modules
        auth/           # Authentication logic
        member/         # User management
        property/       # Real estate listings
        board-article/  # Forum/blog
        comment/        # Comments
        follow/         # Subscriptions
        like/           # Favorites/likes
        view/           # View tracking
      database/         # MongoDB connection
      libs/
        config.ts       # Helper utilities
        dto/            # Data transfer objects (request/response)
        enums/          # Business enums
        types/          # TypeScript types
        interceptor/    # Request/response interceptors
      schemas/          # Mongoose schemas
      socket/           # WebSocket gateway
      
  nestar-batch/
    src/
      batch service for scheduled tasks
```

---

## Key Features Summary

### ✅ **Implemented:**
1. **User Authentication** - Phone/email based signup & login with JWT
2. **Role-Based Access Control** - USER, AGENT, ADMIN roles
3. **Real Estate Listings** - Full property CRUD with advanced search
4. **Social Features** - Follow/unfollow, likes, comments
5. **Community Forum** - Board articles with categories and comments
6. **File Upload** - Image uploads for profiles and properties
7. **Real-time Updates** - WebSocket/Socket.IO integration
8. **Nested Comments** - Threaded comment system
9. **Favorites System** - Like and bookmark properties/articles
10. **View Tracking** - Track property and profile views
11. **Admin Dashboard** - User and content management
12. **Batch Processing** - Scheduled tasks and maintenance

### 🔄 **Typical User Workflows:**

**Property Buyer/Viewer:**
1. Sign up as USER
2. Search and browse properties
3. View property details and images
4. Add properties to favorites
5. Comment on properties
6. Follow agents

**Real Estate Agent:**
1. Sign up as AGENT
2. Create property listings
3. Manage property details and images
4. View listing statistics (views, likes)
5. Respond to comments
6. Build reputation/points

**Administrator:**
1. Monitor all users and content
2. Remove inappropriate comments/posts
3. Manage user accounts and roles
4. View system statistics
5. Enforce community guidelines

---

## Integration Points for New Development

When developing related projects, you can leverage:

1. **GraphQL Schema** - Stable, well-documented API contract
2. **Authentication System** - Reusable JWT-based auth
3. **Database Models** - Clear entity relationships
4. **DTOs & Enums** - Consistent data structures
5. **Error Handling** - Global error formatting
6. **Role-Based Access** - Pluggable RBAC system
7. **WebSocket Infrastructure** - Real-time communication ready
8. **File Upload Pipeline** - Tested upload system

---

## Performance Considerations

1. **Denormalized Counters** - Avoid expensive aggregations
2. **Pagination** - All list queries support pagination
3. **Selective Field Loading** - GraphQL allows clients to request only needed fields
4. **Index Optimization** - Unique and sparse indexes on frequently queried fields
5. **Batch Service** - Offloads heavy operations from main API
6. **WebSocket Events** - Real-time updates without polling

---

**Version:** 1.0  
**Framework:** NestJS 10.0  
**API Type:** GraphQL  
**Database:** MongoDB  
**Last Updated:** January 2026
