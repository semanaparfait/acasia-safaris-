"use client";

// In-memory store seeded from mock data. Changes last until the page is reloaded,
// except packages, which use the shared package store so the website sees them.
// When the backend is ready, swap these setters for API calls.
import React, { createContext, useContext, useState } from "react";
import { setPackages, usePackages } from "@/app/(user)/data/packageStore";
import {
  adminDestinations,
  bookings as seedBookings,
  customers as seedCustomers,
  gallery as seedGallery,
  messages as seedMessages,
  reviews as seedReviews,
  type AdminDestination,
  type AdminPackage,
  type Booking,
  type Customer,
  type GalleryItem,
  type Message,
  type Review,
} from "../data/mock";

type Setter<T> = React.Dispatch<React.SetStateAction<T[]>>;

type Store = {
  bookings: Booking[];
  setBookings: Setter<Booking>;
  packages: AdminPackage[];
  setPackages: Setter<AdminPackage>;
  destinations: AdminDestination[];
  setDestinations: Setter<AdminDestination>;
  customers: Customer[];
  setCustomers: Setter<Customer>;
  messages: Message[];
  setMessages: Setter<Message>;
  reviews: Review[];
  setReviews: Setter<Review>;
  gallery: GalleryItem[];
  setGallery: Setter<GalleryItem>;
};

const AdminContext = createContext<Store | null>(null);

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState(seedBookings);
  const packages = usePackages();
  const [destinations, setDestinations] = useState(adminDestinations);
  const [customers, setCustomers] = useState(seedCustomers);
  const [messages, setMessages] = useState(seedMessages);
  const [reviews, setReviews] = useState(seedReviews);
  const [gallery, setGallery] = useState(seedGallery);

  return (
    <AdminContext.Provider
      value={{
        bookings, setBookings,
        packages, setPackages,
        destinations, setDestinations,
        customers, setCustomers,
        messages, setMessages,
        reviews, setReviews,
        gallery, setGallery,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminStoreProvider");
  return ctx;
}
