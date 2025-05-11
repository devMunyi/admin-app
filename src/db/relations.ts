import { relations } from "drizzle-orm/relations";
import { users, accounts, bookings, clients, hotels, invoices, quotes, cancellations, hotelPolicies, notifications, payments, rateCards, rackRates, reminders, seasons, sessions, transportation, bookingToPayment, invoiceToUser } from "./schema";

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	accounts: many(accounts),
	bookings: many(bookings),
	cancellations: many(cancellations),
	notifications: many(notifications),
	rateCards: many(rateCards),
	sessions: many(sessions),
	invoiceToUsers: many(invoiceToUser),
}));

export const bookingsRelations = relations(bookings, ({one, many}) => ({
	user: one(users, {
		fields: [bookings.agentId],
		references: [users.id]
	}),
	client: one(clients, {
		fields: [bookings.clientId],
		references: [clients.id]
	}),
	hotel: one(hotels, {
		fields: [bookings.hotelId],
		references: [hotels.id]
	}),
	invoice: one(invoices, {
		fields: [bookings.invoiceid],
		references: [invoices.id]
	}),
	quote: one(quotes, {
		fields: [bookings.quoteId],
		references: [quotes.id]
	}),
	cancellations: many(cancellations),
	transportation: many(transportation),
	bookingToPayments: many(bookingToPayment),
}));

export const clientsRelations = relations(clients, ({many}) => ({
	bookings: many(bookings),
	invoices: many(invoices),
	quotes: many(quotes),
}));

export const hotelsRelations = relations(hotels, ({many}) => ({
	bookings: many(bookings),
	hotelPolicies: many(hotelPolicies),
	rackRates: many(rackRates),
	rateCards: many(rateCards),
}));

export const invoicesRelations = relations(invoices, ({one, many}) => ({
	bookings: many(bookings),
	client: one(clients, {
		fields: [invoices.clientId],
		references: [clients.id]
	}),
	quote: one(quotes, {
		fields: [invoices.quoteId],
		references: [quotes.id]
	}),
	payments: many(payments),
	reminders: many(reminders),
	invoiceToUsers: many(invoiceToUser),
}));

export const quotesRelations = relations(quotes, ({one, many}) => ({
	bookings: many(bookings),
	invoices: many(invoices),
	client: one(clients, {
		fields: [quotes.clientId],
		references: [clients.id]
	}),
	rateCard: one(rateCards, {
		fields: [quotes.rateCardId],
		references: [rateCards.id]
	}),
}));

export const cancellationsRelations = relations(cancellations, ({one}) => ({
	booking: one(bookings, {
		fields: [cancellations.bookingId],
		references: [bookings.id]
	}),
	user: one(users, {
		fields: [cancellations.processedById],
		references: [users.id]
	}),
}));

export const hotelPoliciesRelations = relations(hotelPolicies, ({one, many}) => ({
	hotel: one(hotels, {
		fields: [hotelPolicies.hotelId],
		references: [hotels.id]
	}),
	seasons: many(seasons),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one, many}) => ({
	invoice: one(invoices, {
		fields: [payments.invoiceId],
		references: [invoices.id]
	}),
	bookingToPayments: many(bookingToPayment),
}));

export const rateCardsRelations = relations(rateCards, ({one, many}) => ({
	quotes: many(quotes),
	user: one(users, {
		fields: [rateCards.createdById],
		references: [users.id]
	}),
	hotel: one(hotels, {
		fields: [rateCards.hotelId],
		references: [hotels.id]
	}),
	rackRate: one(rackRates, {
		fields: [rateCards.rackRateId],
		references: [rackRates.id]
	}),
}));

export const rackRatesRelations = relations(rackRates, ({one, many}) => ({
	hotel: one(hotels, {
		fields: [rackRates.hotelId],
		references: [hotels.id]
	}),
	rateCards: many(rateCards),
}));

export const remindersRelations = relations(reminders, ({one}) => ({
	invoice: one(invoices, {
		fields: [reminders.invoiceId],
		references: [invoices.id]
	}),
}));

export const seasonsRelations = relations(seasons, ({one}) => ({
	hotelPolicy: one(hotelPolicies, {
		fields: [seasons.hotelPolicyId],
		references: [hotelPolicies.id]
	}),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const transportationRelations = relations(transportation, ({one}) => ({
	booking: one(bookings, {
		fields: [transportation.bookingId],
		references: [bookings.id]
	}),
}));

export const bookingToPaymentRelations = relations(bookingToPayment, ({one}) => ({
	booking: one(bookings, {
		fields: [bookingToPayment.a],
		references: [bookings.id]
	}),
	payment: one(payments, {
		fields: [bookingToPayment.b],
		references: [payments.id]
	}),
}));

export const invoiceToUserRelations = relations(invoiceToUser, ({one}) => ({
	invoice: one(invoices, {
		fields: [invoiceToUser.a],
		references: [invoices.id]
	}),
	user: one(users, {
		fields: [invoiceToUser.b],
		references: [users.id]
	}),
}));