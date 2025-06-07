// src/graphql/operations.ts

import { gql } from '@apollo/client';



// ------------------------------
// PRODUCT OPERATIONS
// ------------------------------

export const GET_PRODUCTS = gql`
  query GetProducts(
    $where:   ProductWhereInput
    $orderBy: [ProductOrderByInput!]
    $take:    Int
    $skip:    Int
  ) {
    products(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
      id
      name
      registration_no
      product_type
      hazard_class
      country
      stato_amministrativo
    }
    productsCount(where: $where)
  }
`;

// ------------------------------
// KPI OPERATIONS
// ------------------------------

export const GET_CATEGORY_KPI = gql`
  query GetCategoryKPI($id: ID!) {
    categoryKPI(where: { id: $id }) {
      id
      name
      kpis(where: { visible: { equals: true } }) {
        id
        title
        currentValue
        target
        description
      }
    }
  }
`;

// fetch list of all visible KPIs (flat list)
export const GET_VISIBLE_KPIS = gql`
  query GetVisibleKPIs {
    kPIS(where: { visible: { equals: true } }, orderBy: { createdAt: desc }) {
      id
      title
      currentValue
      target
      category {
        id
        name
      }
    }
  }
`;

// ------------------------------
// USER OPERATIONS
// ------------------------------

export const UPSERT_USER = gql`
  mutation UpsertUser($email: String!, $name: String!) {
    # This uses Keystone's built-in createUser, but we'll ignore unique errors
    createUser(data: { email: $email, name: $name }) {
      id
    }
  }
`;

export const AUTH_MUTATION = gql`
  mutation Authenticate($email: String!, $password: String!) {
    authenticateUserWithPassword(email: $email, password: $password) {
      ... on UserAuthenticationWithPasswordSuccess {
        sessionToken
        item { id name email isAdmin }
      }
      ... on UserAuthenticationWithPasswordFailure {
        message
      }
    }
  }
`;

//
// 2) Upsert helpers for OAuth users
//
export const FIND_USER = gql`
  query FindUser($email: String!) {
    users(where: { email: { equals: $email } }) {
      id name email isAdmin
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($email: String!, $name: String!) {
    createUser(data: { email: $email, name: $name }) {
      id name email isAdmin
    }
  }
`;


// src/graphql/operations.ts
export const REGISTER_USER_FULL = gql`
  mutation RegisterUserFull(
    $email:           String!
    $password:        String!
    $givenName:       String!
    $familyName:      String!      # ← NEW variable
    $country:         String!
    $farmName:        String!
    $acceptedTerms:   DateTime!
    $acceptedPrivacy: DateTime!
  ) {
    createUser(
      data: {
        # ── auth ───────────────────────────
        email:    $email
        password: $password

        # ── personal profile ──────────────
        name:       $familyName          # ← Keystone “name” gets the family name
        givenName:  $givenName
        country:    $country

        # ── legal flags ───────────────────
        acceptedTerms:   $acceptedTerms
        acceptedPrivacy: $acceptedPrivacy

        # ── bootstrap first Farm — **name only** ──
        farms: { create: { name: $farmName } }
      }
    ) {
      id
      email
      name
      givenName
      farms { id name }
    }
  }
`;


export const SEND_USER_PASSWORD_RESET_LINK = gql`
  mutation SendPwReset($email: String!) {
    sendUserPasswordResetLink(email: $email)
  }
`;


export const REDEEM_USER_PASSWORD_RESET_TOKEN = gql`
  mutation RedeemPwReset($email: String!, $token: String!, $password: String!) {
    redeemUserPasswordResetToken(
      email: $email
      token: $token
      password: $password
    ) {
      code
      message
    }
  }
`;


// ------------------------------
// FARM OPERATIONS
// ------------------------------

export const CREATE_FARM = gql`
  mutation CreateFarm(
    $name: String!
    $createdById: ID!
    $location: JSON!
  ) {
    createFarm(
      data: {
        name: $name
        createdBy: { connect: { id: $createdById } }
        location: $location
      }
    ) {
      id
      name
      location
    }
  }
`;

export const GET_FARMS = gql`
  query GetFarms {
    farms {
      id
      name
      location
      isDefault
      fields {
        id
        name
        areaHectares
      }
    }
  }
`;

export const GET_FARM = gql`
  query GetFarm($id: ID!) {
    farm(where: { id: $id }) {
      id
      name
      location
      isDefault
      fields {
        id
        name
        areaHectares
      }
    }
  }
`;

export const UPDATE_FARM = gql`
  mutation UpdateFarm($id: ID!, $name: String!, $location: JSON!) {
    updateFarm(
      where: { id: $id }
      data: { name: $name, location: $location, }
    ) {
      id
      name
      location
    }
  }
`;

export const DELETE_FARM = gql`
  mutation DeleteFarm($id: ID!) {
    deleteFarm(where: { id: $id }) {
      id
    }
  }
`;


// ------------------------------
// LAND OPERATIONS
// ------------------------------
export const GET_FIELDS = gql`
  query GetFields($farmId: ID!) {
    fields(where: { farm: { id: { equals: $farmId } } }) {
      id
      name
      areaHectares
      location
      boundary
    }
  }
`;

export const GET_USER_FIELDS = gql`
  query GetUserFields($userId: ID!) {
    fields(
      where: { farm: { createdBy: { id: { equals: $userId } } } }
      orderBy: { name: asc }
    ) {
      id
      name
      areaHectares
      location
      boundary
      farm { id name }
    }
  }
`;

export const GET_USER_ORGANISATIONS = gql`
  query GetUserOrganisations($userId: ID!) {
    organisations(
      where: { users: { some: { id: { equals: $userId } } } }
      orderBy: { name: asc }
    ) {
      id
      name
    }
  }
`;

export const GET_USER_FARMS = gql`
  query GetUserFarms($userId: ID!) {
    farms(
      where: { createdBy: { id: { equals: $userId } } }
      orderBy: { name: asc }
    ) {
      id
      name
      location          # { lat, lng } JSON; adjust if your schema differs
      fields { id }     # for the “field count” badge
    }
  }
`;

export const GET_USER_FIELDS_FILTERED = gql`
  query GetUserFieldsFiltered($userId: ID!, $farmId: ID) {
    fields(
      where: {
        farm: {
          createdBy: { id: { equals: $userId } }
          id: { equals: $farmId }
        }
      }
      orderBy: { name: asc }
    ) {
      id
      name
      areaHectares
      boundary
      farm { id name }
    }
  }
`;

export const GET_ALL_FIELDS = gql`
  query GetAllFields {
    fields {
      id
      name
    }
  }
`;

export const GET_FIELD = gql`
  query GetField($id: ID!) {
    field(where: { id: $id }) {
      id
      name
      areaHectares
      location
      boundary
      farm { id name }
    }
  }
`;

export const GET_FIELD_AREA = gql`
  query GetFieldArea($id: ID!) {
    field(where: { id: $id }) {
      id
      areaHectares
    }
  }
`;

/* ----------------------------  MUTATION  ----------------------------- */

export const CREATE_FIELD = gql`
  mutation CreateField(
    $farmId: ID!
    $name: String!
    $areaHectares: Float!
    $location: JSON!
    $boundary: JSON
  ) {
    createField(
      data: {
        farm: { connect: { id: $farmId } }
        name: $name
        areaHectares: $areaHectares
        location: $location
        boundary: $boundary
      }
    ) {
      id
      name
      areaHectares
      location
      boundary
    }
  }
`;

export const UPDATE_FIELD = gql`
  mutation UpdateField(
    $id: ID!
    $farmId: ID!
    $name: String!
    $areaHectares: Float!
    $location: JSON!
    $boundary: JSON
  ) {
    updateField(
      where: { id: $id }
      data: {
        farm: { connect: { id: $farmId } }
        name: $name
        areaHectares: $areaHectares
        location: $location
        boundary: $boundary
      }
    ) {
      id
      name
      areaHectares
      location
      boundary
      farm { id name }
    }
  }
`;

export const DELETE_FIELD = gql`
  mutation DeleteField($id: ID!) {
    deleteField(where: { id: $id }) {
      id
    }
  }
`;




// ------------------------------
// CROP OPERATIONS
// ------------------------------
export const GET_CROP_TYPES = gql`
  query GetCropTypes {
    cropTypes {
      id
      name
    }
  }
`;

export const GET_CROPS = gql`
  query GetCrops($fieldId: ID!) {
    crops(where: { field: { id: { equals: $fieldId } } }) {
      id
      cropAreaHectares
      boundary
      cropType {
        id
        name
      }
    }
  }
`;

export const GET_CROP = gql`
  query GetCrop($id: ID!) {
    crop(where: { id: $id }) {
      id
      cropAreaHectares
      boundary
      cropType {
        id
        name
      }
    }
  }
`;

export const CREATE_CROP = gql`
  mutation CreateCrop(
    $landId: ID!
    $cropTypeId: ID!
    $cropAreaHectares: Float!
    $boundary: JSON
  ) {
    createCrop(
      data: {
        field: { connect: { id: $landId } }
        cropType: { connect: { id: $cropTypeId } }
        cropAreaHectares: $cropAreaHectares
        boundary: $boundary
      }
    ) {
      id
      cropAreaHectares
      cropType { id name }
      boundary
    }
  }
`;

export const UPDATE_CROP = gql`
  mutation UpdateCrop(
    $id: ID!
    $cropTypeId: ID!
    $cropAreaHectares: Float!
    $boundary: JSON
  ) {
    updateCrop(
      where: { id: $id }
      data: {
        cropType: { connect: { id: $cropTypeId } }
        cropAreaHectares: $cropAreaHectares
        boundary: $boundary
      }
    ) {
      id
      cropAreaHectares
      cropType { id name }
      boundary
    }
  }
`;

export const DELETE_CROP = gql`
  mutation DeleteCrop($id: ID!) {
    deleteCrop(where: { id: $id }) {
      id
    }
  }
`;


// ------------------------------
//  DASHBOARD (with optional farm filter)
// ------------------------------
export const GET_DASHBOARD = gql`
  query GetDashboard($where: FarmWhereInput) {
    farms(where: $where) {
      id
      name
      fields {
        areaHectares
        crops {
          cropAreaHectares
          cropType {
            name
          }
        }
      }
    }
  }
`;


// ------------------------------
// WEATHER OPERATIONS
// ------------------------------

/* ------------------------------------------------------------------ */
/*  Weather records for a full calendar year                          */
/* ------------------------------------------------------------------ */
export const GET_WEATHER_RECORDS = gql`
  query WeatherRecords($fieldId: ID!, $start: DateTime!, $end: DateTime!) {
    weatherRecords(
      where: {
        field: { id: { equals: $fieldId } }
        date:  { gte: $start, lte: $end }
      }
      take: 1000               # Keystone returns max 10k – more than enough
    ) {
      id
      date
      temperature
      humidity
      precipitationMm
    }
  }
`;

/* ------------------------------------------------------------------ */
/*  Bulk insert after we fetched from Open-Meteo                      */
/* ------------------------------------------------------------------ */
export const CREATE_WEATHER_RECORDS = gql`
  mutation CreateWeatherRecords($data: [WeatherRecordCreateInput!]!) {
    createWeatherRecords(data: $data) {
      id
    }
  }
`;

/* ------------------------------------------------------------------ */
/*  What the React side really wants – a prepared summary             */
/*  (we’ll hit our API route, not Keystone, so this is *just* a TS    */
/*  helper – not sent to Apollo).                                     */
/* ------------------------------------------------------------------ */
export type WeatherSummary = {
  avgTemperature:      number | null;
  avgHumidity:         number | null;
  totalPrecipitation:  number | null;

  minTemperature:      number | null;
  maxTemperature:      number | null;
  minTemperatureMonth: number | null;   // 1-12
  maxTemperatureMonth: number | null;
  minHumidity:         number | null;
  maxHumidity:         number | null;
  minHumidityMonth:    number | null;
  maxHumidityMonth:    number | null;
};



// ------------------------------
// SOIL OPERATIONS
// ------------------------------


export const GET_SOIL_MEASUREMENTS = gql`
  query GetSoilMeasurements(
    $fieldIds: [ID!]!
    $dateFrom: DateTime
    $dateTo: DateTime
    $skip: Int = 0
    $take: Int = 50
  ) {
    soilMeasurements(
      where: {
        field: { id: { in: $fieldIds } }
        measurementDate: { gte: $dateFrom, lte: $dateTo }
      }
      orderBy: [{ measurementDate: desc }]
      skip: $skip
      take: $take
    ) {
      id
      measurementDate
      sensorId
      ph
      organicMatter
      nitrogen
      moisture
      temperature
      field { id name }
    }
  }
`;

// ------------------------------
// RADAR OPERATIONS
// ------------------------------


// 1) Annual Net Primary Productivity baselines
export const GET_NPP_BASELINES = gql`
  query GetNPPBaselines(
    $fieldId: ID!
    $yearGte: Int
    $yearLte: Int
    $skip: Int!
    $take: Int!
  ) {
    netPrimaryProductivities(
      where: {
        field: { id: { equals: $fieldId } }
        year: { gte: $yearGte, lte: $yearLte }
      }
      orderBy: { year: desc }
      skip: $skip
      take: $take
    ) {
      id
      year
      meanNPP
      totalNPP
      co2e
      recordedAt
    }
  }
`;

// 2) Land‑cover statistics
export const GET_LAND_COVER_STATS = gql`
  query GetLandCoverStats(
    $fieldId: ID!
    $yearGte: Int
    $yearLte: Int
    $skip: Int!
    $take: Int!
  ) {
    landCoverStatistics(
      where: {
        field: { id: { equals: $fieldId } }
        year: { gte: $yearGte, lte: $yearLte }
      }
      orderBy: { year: desc }
      skip: $skip
      take: $take
    ) {
      id
      year
      breakdown
      imageUrl
      recordedAt
    }
  }
`;

// 3) Soil Organic Carbon stocks
export const GET_SOC_STOCKS = gql`
  query GetSoilCarbonStocks(
    $fieldId: ID!
    $yearGte: Int
    $yearLte: Int
    $skip: Int!
    $take: Int!
  ) {
    soilOrganicCarbonStocks(
      where: {
        field: { id: { equals: $fieldId } }
        year: { gte: $yearGte, lte: $yearLte }
      }
      orderBy: { year: desc }
      skip: $skip
      take: $take
    ) {
      id
      year
      meanSOC
      totalSOC
      imageUrl
      recordedAt
    }
  }
`;

// 4) SMAP Soil‑Moisture observations
export const GET_SOIL_MOISTURE = gql`
  query GetSoilMoisture(
    $fieldId: ID!
    $dateFrom: DateTime
    $dateTo: DateTime
    $skip: Int!
    $take: Int!
  ) {
    soilMoistureObservations(
      where: {
        field: { id: { equals: $fieldId } }
        date: { gte: $dateFrom, lte: $dateTo }
      }
      orderBy: { date: asc }
      skip: $skip
      take: $take
    ) {
      id
      date
      meanMoisture
      imageUrl
      recordedAt
    }
  }
`;


export const GET_LAND_PRACTICES = gql`
query GetLandPractices($fieldId: ID!) {
  sustainablePractices(
    where: {
      events: { some: { field: { id: { equals: $fieldId } } } }
    }
    orderBy: { name: asc }
  ) {
    id
    name
    category { name }
    description
  }
}
`;

// fetch all practice‐events for this land, so we know which practices are already adopted
export const GET_PRACTICE_EVENTS = gql`
  query GetPracticeEvents($fieldId: ID!) {
    sustainablePracticeEvents(
      where: { field: { id: { equals: $fieldId } } }
      orderBy: { appliedDate: asc }
    ) {
      practice {
        id
        name
      }
      appliedDate
      parameters
    }
  }
`;


export const GET_SUSTAINABLE_PRACTICES = gql`
  query GetSustainablePractices {
    sustainablePractices(orderBy: { name: asc }) {
      id
      name
      description
    }
  }
`;

export const CREATE_SUSTAINABLE_PRACTICE_EVENT = gql`
  mutation CreateSustainablePracticeEvent(
    $practiceId: ID!
    $fieldId: ID!
    $parameters: JSON
    $targetImpact: Float
    $appliedDate: DateTime!
  ) {
    createSustainablePracticeEvent(
      data: {
        practice:    { connect: { id: $practiceId } }
        field:        { connect: { id: $fieldId } }
        parameters:  $parameters
        targetImpact: $targetImpact
        appliedDate: $appliedDate
      }
    ) {
      id
      field {
        id
        name
      }
      practice {
        id
        name
      }
      parameters
      appliedDate
    }
  }
`;


export const GET_PRACTICE_EVENTS_FOR_PRACTICE = gql`
  query GetPracticeEventsForPractice(
    $fieldId: ID!
    $practiceId: ID!
    $dateFrom: DateTime
    $dateTo: DateTime
  ) {
    sustainablePracticeEvents(
      where: {
        field: { id: { equals: $fieldId } }
        practice: { id: { equals: $practiceId } }
        appliedDate: { gte: $dateFrom, lte: $dateTo }
      }
      orderBy: { appliedDate: desc }
    ) {
      id
      parameters
      targetImpact
      appliedDate
      createdAt
    }
  }
`;

export const GET_OFFSETS_FOR_PRACTICES = gql`
  query GetOffsetsForPractices($practiceIds: [ID!]!) {
    carbonOffsetFactors(
      where: { sustainablePractice: { id: { in: $practiceIds } } }
    ) {
      id
      min
      max
      cropType { id name }
      sustainablePractice { id }
    }
  }
`;




// ------------------------------
// BLOG OPERATIONS
// ------------------------------

export const GET_POSTS = gql`
  query GetPosts {
    posts(where: { status: { equals: "published" } }, orderBy: { publishedAt: desc }) {
      id
      title
      slug
      excerpt
      coverImage {
        url
      }
      publishedAt
      author {
        name
        avatar {
          url
        }
      }
    }
  }
`;

export const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: String!) {
    posts(where: { slug: { equals: $slug } }) {
      id
      title
      content
      coverImage { url }
      publishedAt
      author { name, avatar { url } }
      tags { name, slug }
      category { name }
    }
  }
`;




// ------------------------------
// NEWSLETTER OPERATIONS
// ------------------------------

export const CREATE_NEWSLETTER_SUBSCRIBER = gql`
  mutation CreateSubscriber($email: String!) {
    createNewsletterSubscriber(data: { email: $email }) {
      id
      email
      subscribedAt
    }
  }
`;

export const GET_NEWSLETTER_SUBSCRIBER_BY_EMAIL = gql`
  query SubscriberByEmail($email: String!) {
    newsletterSubscribers(where: { email: { equals: $email } }) {
      id
      email
      isActive
    }
  }
`;

export const UPDATE_NEWSLETTER_SUBSCRIBER = gql`
  mutation UpdateSubscriber($id: ID!, $isActive: Boolean!) {
    updateNewsletterSubscriber(
      where: { id: $id }
      data:  { isActive: $isActive }
    ) {
      id
      isActive
    }
  }
`;


// ------------------------------
// HR OPERATIONS
// ------------------------------

export const GET_JOB_OPENINGS = gql`
  query GetJobOpenings {
    jobOpenings {
      id
      title
      department
      location
      employmentType
      seniority
    }
  }
`;

export const GET_JOB_OPENING = gql`
  query GetJobOpening($where: JobOpeningWhereUniqueInput!) {
    jobOpening(where: $where) {
      id
      title
      department
      location
      employmentType
      seniority
      description
    }
  }
`;

export const CREATE_JOB_CANDIDATE = gql`
  mutation ApplyJob($data: JobCandidateCreateInput!) {
    createJobCandidate(data: $data) {
      id
    }
  }
`;



// ------------------------------
// REFERRAL OPERATIONS
// ------------------------------

/* ‣ PARTNERS ------------------------------------------------------- */
export const GET_REFERRAL_PARTNERS = gql`
  query GetReferralPartners {
    referralPartners(orderBy: { createdAt: desc }) {
      id
      name
      type
      commission_pct
      contactEmail
      ownerUser { id } 
    }
  }
`;

export const CREATE_REFERRAL_PARTNER = gql`
  mutation CreateReferralPartner(
    $name: String!
    $type: String!
    $contactEmail: String!
    $commissionPct: Float!
  ) {
    createReferralPartner(
      data: {
        name: $name
        type: $type
        contactEmail: $contactEmail
        commission_pct: $commissionPct
      }
    ) {
      id
      name
    }
  }
`;

/* create partner row linked to an owner user (defaults to 10 %) */
export const CREATE_REFERRAL_PARTNER_FOR_USER = gql`
  mutation CreateReferralPartnerForUser(
    $name: String!
    $type: String!
    $contactEmail: String!
    $commissionPct: Float!
    $ownerUserId: ID!
  ) {
    createReferralPartner(
      data: {
        name          : $name
        type          : $type
        contactEmail  : $contactEmail
        commission_pct: $commissionPct
        ownerUser     : { connect: { id: $ownerUserId } }
      }
    ) {
      id
    }
  }
`;


/* ─────────── Partner–role helpers ─────────── */

/* search a handful of users by name or e-mail */
export const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    users(
      where: {
        OR: [
          { name:  { contains: $query, mode: insensitive } }
          { email: { contains: $query, mode: insensitive } }
        ]
      }
      take: 10
    ) {
      id
      name
      email
    }
  }
`;

/* list every membership with role = partner (for removal UI) */
export const GET_PARTNER_MEMBERSHIPS = gql`
  query GetPartnerMemberships {
    memberships(where:{ role: { equals: "partner" } }) {
      id
      user { id name email }
    }
  }
`;

/* add role-partner membership to a user */
export const ADD_PARTNER_MEMBERSHIP = gql`
  mutation AddPartnerMembership($userId: ID!) {
    createMembership(
      data: {
        user: { connect: { id: $userId } }
        role: "partner"
      }
    ) { id }
  }
`;

/* remove a membership (role partner) */
export const REMOVE_PARTNER_MEMBERSHIP = gql`
  mutation RemovePartnerMembership($id: ID!) {
    deleteMembership(where:{ id:$id }) { id }
  }
`;


export const CREATE_ORGANISATION = gql`
  mutation CreateOrganisation($data: OrganisationCreateInput!) {
    createOrganisation(data: $data) {
      id
      name
      stripeCustomerId
    }
  }
`;



export const FIND_ORG_BY_CUSTOMER = gql`
  query OrgByCustomer($custId: String!) {
    organisations(where: { stripeCustomerId: { equals: $custId } }) {
      id
    }
  }
`;

export const FIND_PLAN_BY_PRICE = gql`
  query PlanByStripePrice($priceId: String!) {
    planPrices(where: { stripePriceId: { equals: $priceId } }) {
      id
      plan { id }
    }
  }
`;

export const FIND_PLAN_BY_PRODUCT = gql`
  query PlanByProduct($productId: String!) {
    plans(where: { stripeProductId: { equals: $productId } }) {
      id
      prices {
        id
        stripePriceId
      }
    }
  }
`;

/* ------------------------------------------------------------------ */
/*  Get every subscription for the user’s organisation                */
/* ------------------------------------------------------------------ */
export const GET_SUBSCRIPTIONS_BY_USER = gql`
  query SubscriptionsByUser($userId: ID!) {
    user(where: { id: $userId }) {
      memberships(take: 1) {
        organisation {
          id
          subscriptions(orderBy: { startDate: desc }) {
            id
            status
            currentPeriodEnd
            plan { label }
            price  { amount currency }
          }
        }
      }
    }
  }
`;


/* ------------------------------------------------------------------ */
/*  Lookup active Stripe Price ID for a public plan key               */
/* ------------------------------------------------------------------ */
export const FIND_PLAN_PRICE_ID = gql`
  query FindPlanPriceId($key: String!) {
    plan(where: { key: $key }) {
      id
      label
      activePrice {
        id
        stripePriceId
      }
    }
  }
`;

/* ‣ CAMPAIGNS ------------------------------------------------------ */
export const GET_REFERRAL_CAMPAIGNS = gql`
  query GetReferralCampaigns {
    referralCampaigns(orderBy: { startDate: desc }) {
      id
      code
      discount_pct
      startDate
      endDate
      partner { id name }
    }
  }
`;

export const CREATE_REFERRAL_CAMPAIGN = gql`
  mutation CreateReferralCampaign(
    $partnerId: ID!
    $code: String!
    $discountPct: Float!
    $startDate: DateTime
    $endDate: DateTime
  ) {
    createReferralCampaign(
      data: {
        partner: { connect: { id: $partnerId } }
        code: $code
        discount_pct: $discountPct
        startDate: $startDate
        endDate: $endDate
      }
    ) {
      id
      code
    }
  }
`;

/* -----------------------------------------------------------------
   Lookup ONE active referral-campaign (code + valid window)
------------------------------------------------------------------ */
export const FIND_ACTIVE_REFERRAL_CAMPAIGN = gql`
  query FindActiveReferralCampaign($code: String!, $now: DateTime!) {
    referralCampaigns(
      where: {
        code: { equals: $code }
        AND: [
          { OR: [
              { startDate: { equals: null } }
              { startDate: { lte: $now } }
            ]
          }
          { OR: [
              { endDate: { equals: null } }
              { endDate: { gte: $now } }
            ]
          }
        ]
      }
      take: 1
    ) {
      id
      discount_pct
    }
  }
`;

/* update only the commission % of a referral-partner */
export const UPDATE_REFERRAL_PARTNER = gql`
  mutation UpdateReferralPartner($id: ID!, $commissionPct: Float!) {
    updateReferralPartner(
      where:{ id:$id }
      data :{ commission_pct:$commissionPct }
    ){ id commission_pct }
  }
`;



/* -----------------------------------------------------------------
   Create redemption row – stores € (or %) in `discountValue`
------------------------------------------------------------------ */
export const CREATE_REFERRAL_REDEMPTION = gql`
  mutation CreateReferralRedemption(
    $campaignId: ID!
    $userId:      ID!
    $signup:      DateTime!
    $discountValue: Float!
  ) {
    createReferralRedemption(
      data: {
        campaign      : { connect: { id: $campaignId } }
        farmerUser    : { connect: { id: $userId } }
        signupDate    : $signup
        discountValue : $discountValue
      }
    ) {
      id
    }
  }
`;



export const DELETE_REFERRAL_CAMPAIGN = gql`
  mutation DeleteReferralCampaign($id: ID!) {
    deleteReferralCampaign(where: { id: $id }) { id }
  }
`;


/* ‣ MEMBERSHIP ---------------------------------------------------- */
export const CHECK_PARTNER_MEMBERSHIP = gql`
  query CheckPartnerMembership($userId: ID!) {
    memberships(
      where: {
        user: { id: { equals: $userId } }
        role: { equals: "partner" }
      }
      take: 1
    ) {
      id
    }
  }
`;


/* ──────────────────────────────────────────────────────────────
   REFERRAL – dashboard for the logged-in partner
──────────────────────────────────────────────────────────────── */
export const GET_PARTNER_DASHBOARD = gql`
  query GetPartnerDashboard($userId: ID!) {
    referralPartners(where: { ownerUser: { id: { equals: $userId } } }) {
      id
      name
      commission_pct
      campaigns(orderBy: { startDate: desc }) {
        id
        code
        discount_pct
        startDate
        endDate
        redemptions {
          id
          discountValue
          signupDate
          farmerUser  { id name }
          subscription { id status }
        }
      }
    }
  }
`;



/* ── LIST TEMPLATES ────────────────────────────────────────────── */
/*  (added mediaId, ctaLabel, channelMask so the UI could show them
    if you choose to)                                               */
    export const GET_MESSAGE_TEMPLATES = gql`
    query GetMessageTemplates {
      messageTemplates(orderBy: { createdAt: desc }) {
        id
        title
        bodyMarkdown
        type
        urgency
        mediaId
        ctaLabel
        channelMask
        createdAt
      }
    }
  `;
  
  /* ── CREATE TEMPLATE ──────────────────────────────────────────── */
  /*  All arguments are optional except title/type/urgency; align
      with the variables you pass from MessageTemplate.tsx          */
  export const CREATE_MESSAGE_TEMPLATE = gql`
    mutation CreateMessageTemplate(
      $title: String!
      $bodyMarkdown: String
      $type: String!
      $urgency: String!
      $mediaId: String
      $ctaLabel: String
      $ctaLink: String
      $channelMask: JSON
      $requireAcknowledgement: Boolean
      $maxViews: Int
      $startAt: DateTime
      $endAt: DateTime
    ) {
      createMessageTemplate(
        data: {
          title:                 $title
          bodyMarkdown:          $bodyMarkdown
          type:                  $type
          urgency:               $urgency
          mediaId:               $mediaId
          ctaLabel:              $ctaLabel
          ctaLink:               $ctaLink
          channelMask:           $channelMask
          requireAcknowledgement:$requireAcknowledgement
          maxViews:              $maxViews
          startAt:               $startAt
          endAt:                 $endAt
        }
      ) {
        id
      }
    }
  `;
  
  /* ── DELETE TEMPLATE (unchanged) ──────────────────────────────── */
  export const DELETE_MESSAGE_TEMPLATE = gql`
    mutation DeleteMessageTemplate($id: ID!) {
      deleteMessageTemplate(where: { id: $id }) {
        id
      }
    }
  `;
/* --------------------
 *  DELIVERIES
 * ------------------ */

export const GET_MESSAGE_DELIVERIES = gql`
  query GetMessageDeliveries(
    $where: MessageDeliveryWhereInput
    $take:  Int!
    $skip:  Int!
  ) {
    messageDeliveries(
      where:   $where
      orderBy: { createdAt: desc }
      take:    $take
      skip:    $skip
    ) {
      id
      status
      urgency
      views
      lastShownAt
      createdAt

      user     { email }
      template { title type }
      clicks   { id }
    }
  }
`;


/* --------------------
 *  STATISTICS
 * ------------------ */

export const GET_MESSAGE_STATS = gql`
  query GetMessageStats {
    sent:       messageDeliveriesCount
    read:       messageDeliveriesCount(where: { status: { equals: "read" } })
    dismissed:  messageDeliveriesCount(where: { status: { equals: "dismissed" } })
  }
`;



/* ---------- Message centre ops ---------- */

/* ---------- single-message detail (modal) ---------- */
export const GET_MESSAGE_DETAIL = gql`
  query GetMessageDetail($id: ID!) {
    messageDelivery(where: { id: $id }) {
      id
      status
      createdAt
      template {
        title
        bodyMarkdown
        mediaId
        ctaLabel
        ctaLink
      }
    }
  }
`;

export const GET_UNREAD_COUNT = gql`
  query GetUnreadCount {
    deliveriesUnread: messageDeliveriesCount(
      where: { status: { equals: "unread" } }
    )
    alertsUnread: alertsCount(
      where: { status: { equals: "open" } }
    )
  }
`;

/** inbox items (limit 10 each for popup) */
export const GET_INBOX = gql`
  query GetInbox {
    alerts(
      where:{ status:{ equals:"open" } }
      orderBy:{ createdAt:desc }
      take:10
    ){ id message createdAt }

    messageDeliveries(
      where:{ status:{ equals:"unread" } }
      orderBy:{ createdAt:desc }
      take:10
    ){
      id createdAt
      template{ title }
    }
  }
`;


/* mark unread → read */
export const MARK_DELIVERY_READ = gql`
  mutation MarkDeliveryReadModal($id: ID!) {
    updateMessageDelivery(where: { id: $id }, data: { status: "read" }) {
      id
    }
  }
`;

/* remind-later: only touch lastShownAt so status stays “unread” */
export const MARK_DELIVERY_REMIND = gql`
  mutation MarkDeliveryRemind($id: ID!, $ts: DateTime!) {
    updateMessageDelivery(
      where: { id: $id }
      data : { lastShownAt: $ts }
    ) { id }
  }
`;


/** dismiss / mark alert */
export const MARK_ALERT_READ = gql`
  mutation MarkAlertRead($id:ID!){
    updateAlert(
      where:{ id:$id }
      data :{ status:"dismissed" }
    ){ id }
  }
`;


export const UPDATE_MESSAGE_DELIVERY = gql`
  mutation UpdateMessageDelivery($id: ID!, $data: MessageDeliveryUpdateInput!) {
    updateMessageDelivery(where: { id: $id }, data: $data) {
      id
    }
  }
`;


/* create a delivery (template ↔ user) */
export const CREATE_MESSAGE_DELIVERY = gql`
  mutation CreateMessageDelivery($templateId: ID!, $userId: ID!) {
    createMessageDelivery(
      data:{
        template:{ connect:{ id:$templateId } }
        user:    { connect:{ id:$userId } }
      }
    ){ id }
  }
`;



/* ---------- Messages inbox (full lists) ---------- */

/** received (for the logged-in user) */
export const GET_RECEIVED_MESSAGES = gql`
  query GetReceivedMessages(
    $where: MessageDeliveryWhereInput!
    $take:  Int!
    $skip:  Int!
    $search: String
  ) {
    messageDeliveries(
      where: {
        AND: [
          $where
          { template: { title: { contains: $search, mode: insensitive } } }
        ]
      }
      orderBy: { createdAt: desc }
      take:    $take
      skip:    $skip
    ) {
      id
      status
      views
      lastShownAt
      createdAt
      template { id title mediaId }
    }

    messageDeliveriesCount(
      where: {
        AND: [
          $where
          { template: { title: { contains: $search, mode: insensitive } } }
        ]
      }
    )
  }
`;

/** “sent” messages – templates created by this user/organisation */
export const GET_SENT_MESSAGES = gql`
  query GetSentMessages(
    $where: MessageTemplateWhereInput!
    $take:  Int!
    $skip:  Int!
    $search: String
  ) {
    messageTemplates(
      where: {
        AND: [$where, { title: { contains: $search, mode: insensitive } }]
      }
      orderBy: { createdAt: desc }
      take:    $take
      skip:    $skip
    ) {
      id
      title
      type
      urgency
      createdAt
    }

    messageTemplatesCount(
      where: {
        AND: [$where, { title: { contains: $search, mode: insensitive } }]
      }
    )
  }
`;


/* ---------- NOTIFICATIONS (alerts) ---------- */

export const GET_ALERTS = gql`
  query GetAlerts(
    $where: AlertWhereInput!
    $take : Int!
    $skip : Int!
    $search: String
  ) {
    alerts(
      where: {
        AND: [
          $where
          { message: { contains: $search, mode: insensitive } }
        ]
      }
      orderBy: { createdAt: desc }
      take:    $take
      skip:    $skip
    ) {
      id
      message
      urgency
      status
      createdAt
    }

    alertsCount(
      where: {
        AND: [
          $where
          { message: { contains: $search, mode: insensitive } }
        ]
      }
    )
  }
`;


/* 1-alert detail (for the NotificationModal) -------------------- */
export const GET_ALERT_DETAIL = gql`
  query GetAlertDetail($id: ID!) {
    alert(where: { id: $id }) {
      id
      message
      urgency
      status
      due_date
      createdAt
    }
  }
`;


/* list users by role – avoids duplicates with uniq on client */
export const GET_USERS_BY_ROLE = gql`
  query GetUsersByRole($role: String!) {
    memberships(where: { role: { equals: $role } }) {
      user { id email name }
    }
  }
`;




/* --------------  ORGANISATION  --------------------------------------*/
export const FIND_ORG_BY_USER = /* GraphQL */ `
  query OrgByUser($userId: ID!) {
    user(where: { id: $userId }) {
      memberships {
        organisation {
          id
          name
          stripeCustomerId
        }
      }
    }
  }
`;

export const SET_ORG_CUSTOMER_ID = /* GraphQL */ `
  mutation SetOrgCust($orgId: ID!, $custId: String!) {
    updateOrganisation(
      where: { id: $orgId }
      data:  { stripeCustomerId: $custId }
    ) { id }
  }
`;

/* --------------  SUBSCRIPTION  -------------------------------------*/

// ──────────────────────────────────────────────────────────
//  src/graphql/operations.ts  (new / replaced contents)
// ──────────────────────────────────────────────────────────


export const UPDATE_SUBSCRIPTION = /* GraphQL */ `
  mutation UpdateSub(
    $stripeSubId: String!
    $orgId: ID!
    $planId: ID!
    $priceId: ID!
    $status: String!
    $start: DateTime!
    $end: DateTime
  ) {
    updateSubscription(
      where: { stripeSubscriptionId: $stripeSubId }
      data: {
        organisation:         { connect: { id: $orgId } }
        plan:                 { connect: { id: $planId } }
        price:                { connect: { id: $priceId } }
        status:               $status
        startDate:            $start
        currentPeriodEnd:     $end
      }
    ) {
      id
      status
    }
  }
`;

export const CREATE_SUBSCRIPTION = /* GraphQL */ `
  mutation CreateSub(
    $orgId: ID!
    $stripeSubId: String!
    $planId: ID!
    $priceId: ID!
    $status: String!
    $start: DateTime!
    $end: DateTime
  ) {
    createSubscription(
      data: {
        organisation:         { connect: { id: $orgId } }
        stripeSubscriptionId: $stripeSubId
        plan:                 { connect: { id: $planId } }
        price:                { connect: { id: $priceId } }
        status:               $status
        startDate:            $start
        currentPeriodEnd:     $end
      }
    ) {
      id
      status
    }
  }
`;


/* ------------------------------------------------------------------ */
/*  Public catalogue for Pricing page                                 */
/* ------------------------------------------------------------------ */
export const GET_PLANS = gql`
  query GetPlans {
    plans {
      id
      key
      label
      features
      activePrice {
        id
        amount
        currency
      }
    }
  }
`;

/* ------------------------------------------------------------------ */
/*  Lookup active price for checkout                                  */
/* ------------------------------------------------------------------ */
export const FIND_ACTIVE_PRICE_BY_KEY = gql`
  query FindActivePrice($key: String!) {
    plan(where: { key: $key }) {
      id
      activePrice {
        id
        stripePriceId
      }
    }
  }
`;