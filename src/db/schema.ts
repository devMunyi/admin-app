import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, foreignKey, unique, int, varchar, datetime, mysqlEnum, double, text, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"
import { UserRoles, UserStatuses } from "./enums";

export const accounts = mysqlTable("accounts", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
	type: varchar({ length: 191 }).notNull(),
	provider: varchar({ length: 191 }).notNull(),
	providerAccountId: varchar("provider_account_id", { length: 191 }).notNull(),
	refreshToken: varchar("refresh_token", { length: 191 }).default('NULL'),
	accessToken: varchar("access_token", { length: 191 }).default('NULL'),
	expiresAt: int("expires_at").default(sql`NULL`),
	tokenType: varchar("token_type", { length: 191 }).default('NULL'),
	scope: varchar({ length: 191 }).default('NULL'),
	idToken: varchar("id_token", { length: 191 }).default('NULL'),
	sessionState: varchar("session_state", { length: 191 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string', fsp: 3 }).notNull(),
},
	(table) => [
		index("Account_userId_fkey").on(table.userId),
		unique("accounts_provider_provider_account_id_key").on(table.provider, table.providerAccountId),
	]);

export const bookings = mysqlTable("bookings", {
	id: int().autoincrement().notNull(),
	bookingRef: varchar("booking_ref", { length: 191 }).notNull(),
	quoteId: int("quote_id").notNull().references(() => quotes.id, { onDelete: "restrict", onUpdate: "cascade" }),
	clientId: int("client_id").notNull().references(() => clients.id, { onDelete: "restrict", onUpdate: "cascade" }),
	hotelId: int("hotel_id").notNull().references(() => hotels.id, { onDelete: "restrict", onUpdate: "cascade" }),
	travelDate: datetime("travel_date", { mode: 'string', fsp: 3 }).notNull(),
	returnDate: datetime("return_date", { mode: 'string', fsp: 3 }).notNull(),
	mealPlan: mysqlEnum("meal_plan", ['ROOM_ONLY', 'BED_AND_BREAKFAST', 'HALF_BOARD', 'FULL_BOARD', 'ALL_INCLUSIVE']).notNull(),
	roomCategory: mysqlEnum("room_category", ['STANDARD', 'DELUXE', 'SUITE', 'EXECUTIVE', 'PRESIDENTIAL']).notNull(),
	status: mysqlEnum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).default('CONFIRMED').notNull(),
	voucherUrl: varchar("voucher_url", { length: 191 }).default('NULL'),
	agentId: int("agent_id").notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
	invoiceid: int().default(sql`NULL`).references(() => invoices.id, { onDelete: "set null", onUpdate: "cascade" }),
	createdAt: datetime("created_at", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string', fsp: 3 }).notNull(),
},
	(table) => [
		index("Booking_agentId_fkey").on(table.agentId),
		index("Booking_clientId_fkey").on(table.clientId),
		index("Booking_hotelId_fkey").on(table.hotelId),
		unique("bookings_booking_ref_key").on(table.bookingRef),
		unique("bookings_quote_id_key").on(table.quoteId),
		unique("bookings_invoiceid_key").on(table.invoiceid),
	]);

export const cancellations = mysqlTable("cancellations", {
	id: int().autoincrement().notNull(),
	bookingId: int("booking_id").notNull().references(() => bookings.id, { onDelete: "restrict", onUpdate: "cascade" }),
	cancellationDate: datetime("cancellation_date", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	reason: varchar({ length: 191 }).default('NULL'),
	hotelCharges: double("hotel_charges").notNull(),
	creditNoteUrl: varchar("credit_note_url", { length: 191 }).default('NULL'),
	refundAmount: double("refund_amount").notNull(),
	processedById: int("processed_by_id").notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
	createdAt: datetime("created_at", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string', fsp: 3 }).notNull(),
},
	(table) => [
		index("Cancellation_bookingId_fkey").on(table.bookingId),
		index("Cancellation_processedById_fkey").on(table.processedById),
	]);

export const clients = mysqlTable("clients", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 191 }).notNull(),
	email: varchar({ length: 191 }).notNull(),
	phone: varchar({ length: 191 }).notNull(),
	address: varchar({ length: 191 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string', fsp: 3 }).notNull(),
},
	(table) => [
		unique("clients_email_key").on(table.email),
	]);

export const eventsLog = mysqlTable("events_log", {
	id: int().autoincrement().notNull(),
	tbl: varchar({ length: 30 }).notNull(),
	fld: int().notNull(),
	details: text().notNull(),
	eventDate: datetime("event_date", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	eventBy: int("event_by").default(0).notNull(),
	status: int().default(1).notNull(),
});

export const hotels = mysqlTable("hotels", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 191 }).notNull(),
	location: varchar({ length: 191 }).notNull(),
	contactEmail: varchar("contact_email", { length: 191 }).notNull(),
	contactPhone: varchar("contact_phone", { length: 191 }).notNull(),
	commissionRate: double("commission_rate").default(sql`NULL`),
	createdAt: datetime("created_at", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string', fsp: 3 }).notNull(),
});

export const hotelPolicies = mysqlTable("hotel_policies", {
	id: int().autoincrement().notNull(),
	cancellation: varchar({ length: 191 }).notNull(),
	paymentTerms: varchar("payment_terms", { length: 191 }).notNull(),
	commissionTerms: varchar("commission_terms", { length: 191 }).notNull(),
	hotelId: int("hotel_id").notNull().references(() => hotels.id, { onDelete: "restrict", onUpdate: "cascade" }),
},
	(table) => [
		index("HotelPolicy_hotelId_fkey").on(table.hotelId),
	]);

export const invoices = mysqlTable("invoices", {
	id: int().autoincrement().notNull(),
	invoiceNumber: varchar("invoice_number", { length: 191 }).notNull(),
	quoteId: int("quote_id").notNull().references(() => quotes.id, { onDelete: "restrict", onUpdate: "cascade" }),
	clientId: int("client_id").notNull().references(() => clients.id, { onDelete: "restrict", onUpdate: "cascade" }),
	amount: double().notNull(),
	taxAmount: double("tax_amount").notNull(),
	totalAmount: double("total_amount").notNull(),
	dueDate: datetime("due_date", { mode: 'string', fsp: 3 }).notNull(),
	status: mysqlEnum(['UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'REFUNDED']).default('UNPAID').notNull(),
	createdAt: datetime("created_at", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string', fsp: 3 }).notNull(),
},
	(table) => [
		index("Invoice_clientId_fkey").on(table.clientId),
		unique("invoices_invoice_number_key").on(table.invoiceNumber),
		unique("invoices_quote_id_key").on(table.quoteId),
	]);

export const notifications = mysqlTable("notifications", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
	title: varchar({ length: 191 }).notNull(),
	message: varchar({ length: 191 }).notNull(),
	isRead: tinyint("is_read").default(0).notNull(),
	readAt: datetime("read_at", { mode: 'string', fsp: 3 }).default('NULL'),
	type: mysqlEnum(['PAYMENT_REMINDER', 'BOOKING_CONFIRMATION', 'INVOICE_GENERATED', 'CANCELLATION', 'SYSTEM_ALERT']).notNull(),
	referenceId: int("reference_id").default(sql`NULL`),
	referenceType: varchar("reference_type", { length: 191 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string', fsp: 3 }).notNull(),
},
	(table) => [
		index("Notification_userId_fkey").on(table.userId),
	]);

export const payments = mysqlTable("payments", {
	id: int().autoincrement().notNull(),
	invoiceId: int("invoice_id").notNull().references(() => invoices.id, { onDelete: "restrict", onUpdate: "cascade" }),
	amount: double().notNull(),
	paymentDate: datetime("payment_date", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	paymentMethod: mysqlEnum("payment_method", ['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CHEQUE']).notNull(),
	transactionId: varchar("transaction_id", { length: 191 }).default('NULL'),
	receiptUrl: varchar("receipt_url", { length: 191 }).default('NULL'),
	isConfirmed: tinyint("is_confirmed").default(0).notNull(),
	confirmedAt: datetime("confirmed_at", { mode: 'string', fsp: 3 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string', fsp: 3 }).notNull(),
},
	(table) => [
		index("Payment_invoiceId_fkey").on(table.invoiceId),
	]);

export const permissions = mysqlTable("permissions", {
	id: int().autoincrement().notNull(),
	role: mysqlEnum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENT', 'ACCOUNTANT']).notNull(),
	userId: int("user_id").default(0).notNull(),
	tbl: varchar({ length: 50 }).notNull(),
	rec: int().default(0).notNull(),
	general: int().default(0).notNull(),
	create: int().default(0).notNull(),
	read: int().default(0).notNull(),
	update: int().default(0).notNull(),
	delete: int().default(0).notNull(),
	customAction: varchar("custom_action", { length: 40 }).default('NULL'),
	addedBy: int("added_by").default(0).notNull(),
	createdAt: datetime("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string' }).default('NULL'),
	status: int().default(1).notNull(),
},
	(table) => [
		index("group_id").on(table.role),
		index("idx_o_permissions_rec").on(table.rec),
		index("idx_o_permissions_status").on(table.status),
		index("idx_o_permissions_tbl").on(table.tbl),
		index("user_id").on(table.userId),
	]);

export const quotes = mysqlTable("quotes", {
	id: int().autoincrement().notNull(),
	rateCardId: int("rate_card_id").notNull().references(() => rateCards.id, { onDelete: "restrict", onUpdate: "cascade" }),
	clientId: int("client_id").notNull().references(() => clients.id, { onDelete: "restrict", onUpdate: "cascade" }),
	status: mysqlEnum(['ACTIVE', 'CONVERTED', 'EXPIRED']).default('ACTIVE').notNull(),
	expirationDate: datetime("expiration_date", { mode: 'string', fsp: 3 }).notNull(),
	createdAt: datetime("created_at", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string', fsp: 3 }).notNull(),
},
	(table) => [
		index("Quote_clientId_fkey").on(table.clientId),
		index("Quote_rateCardId_fkey").on(table.rateCardId),
	]);

export const rackRates = mysqlTable("rack_rates", {
	id: int().autoincrement().notNull(),
	rate: double().notNull(),
	currency: varchar({ length: 191 }).default('KES').notNull(),
	travelPeriod: mysqlEnum("travel_period", ['LOW_SEASON', 'SHOULDER_SEASON', 'HIGH_SEASON', 'PEAK_SEASON']).notNull(),
	mealPlan: mysqlEnum("meal_plan", ['ROOM_ONLY', 'BED_AND_BREAKFAST', 'HALF_BOARD', 'FULL_BOARD', 'ALL_INCLUSIVE']).notNull(),
	roomCategory: mysqlEnum("room_category", ['STANDARD', 'DELUXE', 'SUITE', 'EXECUTIVE', 'PRESIDENTIAL']).notNull(),
	pdfUrl: varchar("pdf_url", { length: 191 }).default('NULL'),
	isProcessed: tinyint().default(0).notNull(),
	processedDate: datetime("processed_date", { mode: 'string', fsp: 3 }).default('NULL'),
	hotelId: int("hotel_id").notNull().references(() => hotels.id, { onDelete: "restrict", onUpdate: "cascade" }),
	createdAt: datetime("created_at", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string', fsp: 3 }).notNull(),
},
	(table) => [
		index("RackRate_hotelId_fkey").on(table.hotelId),
	]);

export const rateCards = mysqlTable("rate_cards", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 191 }).notNull(),
	baseRate: double("base_rate").notNull(),
	commissionRate: double("commission_rate").default(sql`NULL`),
	markupRate: double("markup_rate").default(sql`NULL`),
	discountAmount: double("discount_amount").default(sql`NULL`),
	discountPercent: double("discount_percent").default(sql`NULL`),
	finalRate: double("final_rate").notNull(),
	currency: varchar({ length: 191 }).default('\'USD\'').notNull(),
	travelPeriod: mysqlEnum("travel_period", ['LOW_SEASON', 'SHOULDER_SEASON', 'HIGH_SEASON', 'PEAK_SEASON']).notNull(),
	mealPlan: mysqlEnum("meal_plan", ['ROOM_ONLY', 'BED_AND_BREAKFAST', 'HALF_BOARD', 'FULL_BOARD', 'ALL_INCLUSIVE']).notNull(),
	roomCategory: mysqlEnum("room_category", ['STANDARD', 'DELUXE', 'SUITE', 'EXECUTIVE', 'PRESIDENTIAL']).notNull(),
	commission: double().default(sql`NULL`),
	isActive: tinyint("is_active").default(1).notNull(),
	rackRateId: int("rack_rate_id").notNull().references(() => rackRates.id, { onDelete: "restrict", onUpdate: "cascade" }),
	hotelId: int("hotel_id").notNull().references(() => hotels.id, { onDelete: "restrict", onUpdate: "cascade" }),
	createdById: int("created_by_id").notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
	createdAt: datetime("created_at", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string', fsp: 3 }).notNull(),
},
	(table) => [
		index("RateCard_createdById_fkey").on(table.createdById),
		index("RateCard_hotelId_fkey").on(table.hotelId),
		index("RateCard_rackRateId_fkey").on(table.rackRateId),
	]);

export const reminders = mysqlTable("reminders", {
	id: int().autoincrement().notNull(),
	invoiceId: int("invoice_id").notNull().references(() => invoices.id, { onDelete: "restrict", onUpdate: "cascade" }),
	reminderDate: datetime("reminder_date", { mode: 'string', fsp: 3 }).notNull(),
	message: varchar({ length: 191 }).notNull(),
	isSent: tinyint("is_sent").default(0).notNull(),
	sentAt: datetime("sent_at", { mode: 'string', fsp: 3 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string', fsp: 3 }).notNull(),
},
	(table) => [
		index("Reminder_invoiceId_fkey").on(table.invoiceId),
	]);

export const seasons = mysqlTable("seasons", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 191 }).notNull(),
	periodType: mysqlEnum("period_type", ['LOW_SEASON', 'SHOULDER_SEASON', 'HIGH_SEASON', 'PEAK_SEASON']).notNull(),
	startDate: datetime("start_date", { mode: 'string', fsp: 3 }).notNull(),
	endDate: datetime("end_date", { mode: 'string', fsp: 3 }).notNull(),
	hotelPolicyId: int("hotel_policy_id").notNull().references(() => hotelPolicies.id, { onDelete: "restrict", onUpdate: "cascade" }),
},
	(table) => [
		index("SeasonDate_hotelPolicyId_fkey").on(table.hotelPolicyId),
	]);

export const sessions = mysqlTable("sessions", {
	id: int().autoincrement().notNull(),
	sessionToken: varchar("session_token", { length: 191 }).notNull(),
	userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
	expires: datetime({ mode: 'string', fsp: 3 }).notNull(),
	createdAt: datetime("created_at", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string', fsp: 3 }).notNull(),
	status: int().default(1).notNull(),
},
	(table) => [
		index("Session_userId_fkey").on(table.userId),
		unique("sessions_session_token_key").on(table.sessionToken),
	]);

export const transportation = mysqlTable("transportation", {
	id: int().autoincrement().notNull(),
	type: mysqlEnum(['AIR', 'SGR', 'SGR_TRANSFER', 'ROAD', 'OTHER']).notNull(),
	provider: varchar({ length: 191 }).notNull(),
	bookingRef: varchar("booking_ref", { length: 191 }).default('NULL'),
	departureDate: datetime("departure_date", { mode: 'string', fsp: 3 }).notNull(),
	returnDate: datetime("return_date", { mode: 'string', fsp: 3 }).default('NULL'),
	departurePoint: varchar("departure_point", { length: 191 }).notNull(),
	arrivalPoint: varchar("arrival_point", { length: 191 }).notNull(),
	cost: double().notNull(),
	bookingId: int("booking_id").notNull().references(() => bookings.id, { onDelete: "restrict", onUpdate: "cascade" }),
	status: mysqlEnum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).default('CONFIRMED').notNull(),
	createdAt: datetime("created_at", { mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string', fsp: 3 }).notNull(),
},
	(table) => [
		index("Transportation_bookingId_fkey").on(table.bookingId),
	]);

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 191 }).notNull(),
	email: varchar({ length: 191 }).notNull(),
	emailVerified: datetime("email_verified", { mode: 'string' }).default(sql`NULL`),
	image: varchar({ length: 191 }).default('NULL'),
	password: varchar({ length: 191 }).notNull(),
	salt: varchar({ length: 255 }).default('NULL'),
	role: mysqlEnum('role', Object.values(UserRoles) as [string, ...string[]]).default('AGENT').notNull(),
	createdAt: datetime("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: datetime("updated_at", { mode: 'string' }).default(sql`NULL`),
	status: mysqlEnum('status', Object.values(UserStatuses) as [string, ...string[]]).default('PENDING').notNull(),
},
	(table) => [
		unique("users_email_key").on(table.email),
	]);

export const bookingToPayment = mysqlTable("_BookingToPayment", {
	a: int("A").notNull().references(() => bookings.id, { onDelete: "cascade", onUpdate: "cascade" }),
	b: int("B").notNull().references(() => payments.id, { onDelete: "cascade", onUpdate: "cascade" }),
},
	(table) => [
		index("_BookingToPayment_B_index").on(table.b),
		unique("_BookingToPayment_AB_unique").on(table.a, table.b),
	]);

export const invoiceToUser = mysqlTable("_InvoiceToUser", {
	a: int("A").notNull().references(() => invoices.id, { onDelete: "cascade", onUpdate: "cascade" }),
	b: int("B").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
},
	(table) => [
		index("_InvoiceToUser_B_index").on(table.b),
		unique("_InvoiceToUser_AB_unique").on(table.a, table.b),
	]);
