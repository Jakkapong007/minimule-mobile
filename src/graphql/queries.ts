import { gql } from '@apollo/client';

// ── Fragments ──────────────────────────────────────────────────────────────────

export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    email
    fullName
    avatarUrl
    role
    phone
  }
`;

export const POST_FRAGMENT = gql`
  fragment PostFields on Post {
    id
    imageUrl
    caption
    isStickerDesign
    visibility
    likeCount
    commentCount
    voteCount
    isLikedByMe
    isVotedByMe
    createdAt
    user {
      id
      fullName
      avatarUrl
    }
    category {
      id
      name
    }
  }
`;

export const PRODUCT_FRAGMENT = gql`
  fragment ProductFields on Product {
    id
    name
    description
    basePrice
    stockQty
    status
    isFeatured
    avgRating
    reviewCount
    images {
      id
      imageUrl
      isPrimary
    }
    category {
      id
      name
    }
  }
`;

// ── Auth ───────────────────────────────────────────────────────────────────────

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

export const REGISTER = gql`
  mutation Register($email: String!, $password: String!, $name: String!) {
    register(email: $email, password: $password, name: $name) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const ME = gql`
  query Me {
    me {
      ...UserFields
      profile {
        id
        bio
        preferredLanguage
        pdpaConsent
      }
      addresses {
        id
        label
        recipientName
        phone
        addressLine1
        addressLine2
        province
        postalCode
        isDefault
      }
    }
  }
  ${USER_FRAGMENT}
`;

// ── Feed ───────────────────────────────────────────────────────────────────────

export const FEED = gql`
  query Feed($limit: Int, $offset: Int) {
    feed(limit: $limit, offset: $offset) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

export const POST_DETAIL = gql`
  query PostDetail($id: ID!) {
    post(id: $id) {
      ...PostFields
      comments(limit: 50) {
        id
        body
        createdAt
        user {
          id
          fullName
          avatarUrl
        }
      }
    }
  }
  ${POST_FRAGMENT}
`;

export const USER_POSTS = gql`
  query UserPosts($userId: ID!, $limit: Int, $offset: Int) {
    userPosts(userId: $userId, limit: $limit, offset: $offset) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

export const STICKER_DESIGNS = gql`
  query StickerDesigns($limit: Int, $offset: Int) {
    stickerDesigns(limit: $limit, offset: $offset) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

export const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      likeCount
      isLikedByMe
    }
  }
`;

export const UNLIKE_POST = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId) {
      id
      likeCount
      isLikedByMe
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($postId: ID!, $body: String!) {
    addComment(postId: $postId, body: $body) {
      id
      body
      createdAt
      user {
        id
        fullName
        avatarUrl
      }
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

// ── Shop ───────────────────────────────────────────────────────────────────────

export const PRODUCTS = gql`
  query Products($limit: Int, $offset: Int, $categoryId: ID, $minPrice: Float, $maxPrice: Float, $isFeatured: Boolean, $sort: SortOrder) {
    products(limit: $limit, offset: $offset, categoryId: $categoryId, minPrice: $minPrice, maxPrice: $maxPrice, isFeatured: $isFeatured, sort: $sort) {
      ...ProductFields
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const PRODUCT = gql`
  query Product($id: ID!) {
    product(id: $id) {
      ...ProductFields
      variants {
        id
        sku
        size
        color
        material
        priceModifier
        stockQty
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const CATEGORIES = gql`
  query Categories {
    categories {
      id
      name
      slug
      iconUrl
    }
  }
`;

export const MY_CART = gql`
  query MyCart {
    myCart {
      id
      status
      updatedAt
      items {
        id
        quantity
        unitPrice
        product {
          id
          name
          images {
            imageUrl
            isPrimary
          }
        }
      }
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!, $quantity: Int!) {
    addToCart(productId: $productId, quantity: $quantity) {
      id
      items {
        id
        quantity
        unitPrice
        product {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($cartItemId: ID!, $quantity: Int!) {
    updateCartItem(cartItemId: $cartItemId, quantity: $quantity) {
      id
      items {
        id
        quantity
        unitPrice
        product {
          id
          name
        }
      }
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      orderNumber
      status
      subtotal
      discountAmount
      shippingFee
      total
      promotionCode
      createdAt
    }
  }
`;

// ── Profile & Account ──────────────────────────────────────────────────────────

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...UserFields
      profile { id bio preferredLanguage pdpaConsent }
    }
  }
  ${USER_FRAGMENT}
`;

export const ACCEPT_PDPA = gql`
  mutation AcceptPDPA($version: String!) {
    acceptPDPA(version: $version) {
      ...UserFields
      profile { id pdpaConsent }
    }
  }
  ${USER_FRAGMENT}
`;

export const ADD_ADDRESS = gql`
  mutation AddAddress($input: AddAddressInput!) {
    addAddress(input: $input) {
      id label recipientName phone addressLine1 addressLine2 province postalCode isDefault
    }
  }
`;

export const REMOVE_ADDRESS = gql`
  mutation RemoveAddress($id: ID!) { removeAddress(id: $id) }
`;

export const SET_DEFAULT_ADDRESS = gql`
  mutation SetDefaultAddress($id: ID!) {
    setDefaultAddress(id: $id) {
      id isDefault
    }
  }
`;

export const ADD_PAYMENT_METHOD = gql`
  mutation AddPaymentMethod($input: AddPaymentMethodInput!) {
    addPaymentMethod(input: $input) {
      id type label lastFour brand isDefault
    }
  }
`;

export const REMOVE_PAYMENT_METHOD = gql`
  mutation RemovePaymentMethod($id: ID!) { removePaymentMethod(id: $id) }
`;

export const SET_DEFAULT_PAYMENT = gql`
  mutation SetDefaultPayment($id: ID!) {
    setDefaultPaymentMethod(id: $id) { id isDefault }
  }
`;

export const MY_PAYMENT_METHODS = gql`
  query MyPaymentMethods {
    myPaymentMethods { id type label lastFour brand isDefault }
  }
`;

// ── Shipping & Promotions ─────────────────────────────────────────────────────

export const SHIPPING_METHODS = gql`
  query ShippingMethods {
    shippingMethods {
      id name description carrier estimatedDaysMin estimatedDaysMax baseFee
    }
  }
`;

export const CHECK_PROMO = gql`
  query CheckPromo($code: String!, $orderTotal: Float!) {
    checkPromoCode(code: $code, orderTotal: $orderTotal) {
      valid message discountAmount
      promotion { id code description discountType discountValue }
    }
  }
`;

// ── Reviews ───────────────────────────────────────────────────────────────────

export const PRODUCT_REVIEWS = gql`
  query ProductReviews($productId: ID!, $limit: Int, $offset: Int) {
    productReviews(productId: $productId, limit: $limit, offset: $offset) {
      id rating body createdAt
      user { id fullName avatarUrl }
    }
  }
`;

export const ADD_REVIEW = gql`
  mutation AddReview($input: AddReviewInput!) {
    addReview(input: $input) {
      id rating body createdAt
      user { id fullName avatarUrl }
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) { deleteReview(id: $id) }
`;

// ── Notifications ─────────────────────────────────────────────────────────────

export const MY_NOTIFICATIONS = gql`
  query MyNotifications($limit: Int, $offset: Int) {
    myNotifications(limit: $limit, offset: $offset) {
      unreadCount
      items { id type title body isRead createdAt }
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) { id isRead }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead { markAllNotificationsRead }
`;

// ── Search ────────────────────────────────────────────────────────────────────

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($query: String!, $limit: Int, $offset: Int) {
    searchProducts(query: $query, limit: $limit, offset: $offset) {
      total
      products { ...ProductFields }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const MY_SEARCH_HISTORY = gql`
  query MySearchHistory { mySearchHistory }
`;

export const CLEAR_SEARCH_HISTORY = gql`
  mutation ClearSearchHistory { clearSearchHistory }
`;

export const SET_DEFAULT_PAYMENT_METHOD = SET_DEFAULT_PAYMENT;

// ── Showcase ──────────────────────────────────────────────────────────────────

export const SHOWCASE = gql`
  query Showcase($limit: Int, $offset: Int) {
    showcase(limit: $limit, offset: $offset) { ...PostFields }
  }
  ${POST_FRAGMENT}
`;

export const VOTE_POST = gql`
  mutation VotePost($postId: ID!) {
    votePost(postId: $postId) { id voteCount isVotedByMe }
  }
`;

export const UNVOTE_POST = gql`
  mutation UnvotePost($postId: ID!) {
    unvotePost(postId: $postId) { id voteCount isVotedByMe }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($cartItemId: ID!) {
    removeFromCart(cartItemId: $cartItemId) {
      id
      items { id quantity unitPrice product { id name images { imageUrl isPrimary } } }
    }
  }
`;

export const MY_ORDERS = gql`
  query MyOrders {
    myOrders {
      id
      orderNumber
      status
      subtotal
      total
      createdAt
      items {
        id
        quantity
        unitPrice
        product {
          id
          name
          images {
            imageUrl
            isPrimary
          }
        }
      }
    }
  }
`;
