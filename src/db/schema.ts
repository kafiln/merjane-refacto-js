import { relations } from 'drizzle-orm';
import {
	date,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	serial, varchar,
} from 'drizzle-orm/pg-core';


// Declaring enum in database
const ProductType = pgEnum('type', ['NORMAL', 'SEASONAL','EXPIRABLE',"FLASHSALE"]);

export const products = pgTable('products', {
	id: serial('id').primaryKey(),
	leadTime: integer('lead_time').notNull(),
	available: integer('available').notNull(),
	type: ProductType('type').notNull().default('NORMAL'),
	name: varchar('name', {length: 256}).notNull(),
	expiryDate: date('expiry_date', {mode: 'date'}),
	seasonStartDate: date('season_start_date', {mode: 'date'}),
	seasonEndDate: date('season_end_date', {mode: 'date'}),
	flashSaleStart:date('flash_sale_start', {mode: 'date'}),
	flashSaleEnd:date('flash_sale_end', {mode: 'date'}),
	maxFlashSaleQuantity:integer('max_flash_sale_quantity').notNull(),
});

export type Product = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;

export const orders = pgTable('orders', {
	id: serial('id').primaryKey().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type OrderInsert = typeof orders.$inferInsert;

export const ordersToProducts = pgTable('orders_to_products', {
	orderId: integer('order_id').references(() => orders.id).notNull(),
	productId: integer('product_id').references(() => products.id).notNull(),
}, t => ({
	pk: primaryKey({columns: [t.orderId, t.productId]}),
}));

export const productsRelations = relations(products, ({many}) => ({
	orders: many(ordersToProducts),
}));

export const ordersRelations = relations(orders, ({many}) => ({
	products: many(ordersToProducts),
}));

export const ordersToProductsRelations = relations(ordersToProducts, ({one}) => ({
	product: one(products, {
		fields: [ordersToProducts.productId],
		references: [products.id],
	}),
	order: one(orders, {
		fields: [ordersToProducts.orderId],
		references: [orders.id],
	}),
}));

