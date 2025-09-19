export enum UserOrganizationRole {
  // Can do everything within an organization
  OWNER = 'owner',

  // Can do everything withing an organization except transferring ownership and deleting it
  ADMIN = 'admin',

  // Can only read transactions data
  ACCOUTANT = 'accountant',

  // Can manage catalog, including creating, reading, updating and deleting products, accounting groups and screens
  SUPPLY_MANAGER = 'supply_manager',

  // Can read the catalog and create transactions and read its own transactions
  POINT_OF_SALE = 'point_of_sale',

  // Don't have any rights
  NONE = 'none',
}
