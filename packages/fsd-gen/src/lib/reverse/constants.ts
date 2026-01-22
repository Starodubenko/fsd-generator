/**
 * Entity token types used in reverse engineering templates.
 * These tokens are placeholders that get replaced during code generation.
 */
export const EntityToken = {
    /**
     * Base entity name in PascalCase.
     * Example: "User", "Product", "OrderItem"
     * Used in: class names, type names, component names
     */
    NAME: '{{name}}',

    /**
     * Entity name in PascalCase (alias for NAME).
     * Example: "User", "Product", "OrderItem"
     * Used in: class names, type names, component names
     */
    ENTITY_NAME: '{{entityName}}',

    /**
     * Entity name in camelCase.
     * Example: "user", "product", "orderItem"
     * Used in: variable names, function names, parameter names
     */
    ENTITY_NAME_CAMEL: '{{entityNameCamel}}',

    /**
     * Entity name in lowercase (no separators).
     * Example: "user", "product", "orderitem"
     * Used in: URLs, file paths, database table names
     */
    ENTITY_NAME_LOWER: '{{entityNameLower}}',

    /**
     * Entity name in UPPERCASE (no separators).
     * Example: "USER", "PRODUCT", "ORDERITEM"
     * Used in: constants, environment variables, enum values
     */
    ENTITY_NAME_UPPER: '{{entityNameUpper}}',

    /**
     * Entity name in kebab-case.
     * Example: "user", "product", "order-item"
     * Used in: CSS class names, HTML attributes, URLs
     */
    ENTITY_NAME_KEBAB: '{{entityNameKebab}}'
} as const;

/**
 * Type representing any valid entity token value
 */
export type EntityTokenValue = typeof EntityToken[keyof typeof EntityToken];

/**
 * Helper to check if a string is a valid entity token
 */
export function isEntityToken(value: string): value is EntityTokenValue {
    return Object.values(EntityToken).includes(value as EntityTokenValue);
}

/**
 * FSD (Feature-Sliced Design) layer types.
 * Represents the architectural layers in FSD methodology.
 */
export const FsdLayer = {
    /**
     * Entity layer - Business entities and domain models
     * Example: User, Product, Order
     */
    ENTITY: 'entity',

    /**
     * Feature layer - User interactions and business features
     * Example: Authentication, ProductCatalog, Checkout
     */
    FEATURE: 'feature',

    /**
     * Widget layer - Composite UI blocks
     * Example: Header, Sidebar, ProductCard
     */
    WIDGET: 'widget',

    /**
     * Page layer - Application pages/routes
     * Example: HomePage, ProfilePage, ProductPage
     */
    PAGE: 'page',

    /**
     * Shared layer - Reusable utilities and components
     * Example: UI kit, helpers, constants
     */
    SHARED: 'shared'
} as const;

/**
 * Type representing any valid FSD layer value
 */
export type FsdLayerValue = typeof FsdLayer[keyof typeof FsdLayer];

/**
 * Helper to check if a string is a valid FSD layer
 */
export function isFsdLayer(value: string): value is FsdLayerValue {
    return Object.values(FsdLayer).includes(value as FsdLayerValue);
}
