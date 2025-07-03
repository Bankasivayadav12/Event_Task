"use client";

import { useEffect, useState } from "react";

const API_KEY = "ZQpAm1jeTmh4lKrx7K8ihYylvLMZdte5";
const EVENTS_PER_PAGE = 6;

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
        url.searchParams.set("apikey", API_KEY);
        url.searchParams.set("size", "50");

        const res = await fetch(url.toString());
        const data = await res.json();

        if (data._embedded?.events) {
          setEvents(data._embedded.events);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      }
      setLoading(false);
    }

    fetchEvents();
  }, []);

  // Filter by country and date
  const filteredEvents = events.filter((e: any) => {
    const eventDate = new Date(e.dates?.start?.dateTime || "");

    const countryMatch = country
      ? e._embedded?.venues?.[0]?.country?.name
          ?.toLowerCase()
          .includes(country.toLowerCase())
      : true;

    const startDateMatch = startDate ? eventDate >= new Date(startDate) : true;
    const endDateMatch = endDate ? eventDate <= new Date(endDate) : true;

    return countryMatch && startDateMatch && endDateMatch;
  });

  // Sort by name/date
  const sortedEvents = [...filteredEvents].sort((a: any, b: any) => {
    const aDate = new Date(a.dates.start.dateTime);
    const bDate = new Date(b.dates.start.dateTime);

    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "date-asc":
        return aDate.getTime() - bDate.getTime();
      case "date-desc":
        return bDate.getTime() - aDate.getTime();
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedEvents.length / EVENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const currentEvents = sortedEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 tracking-tight">
        🎫 Trending Events Near You
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <input
          type="text"
          placeholder="Search by country"
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setCurrentPage(1);
          }}
          className="p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setCurrentPage(1);
          }}
          className="p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setCurrentPage(1);
          }}
          className="p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sort By</option>
          <option value="name-asc">Name ↑</option>
          <option value="name-desc">Name ↓</option>
          <option value="date-asc">Date ↑</option>
          <option value="date-desc">Date ↓</option>
        </select>
      </div>

      {/* Event Cards */}
      {loading ? (
        <p className="text-center text-blue-600 text-lg">Loading events...</p>
      ) : currentEvents.length === 0 ? (
        <p className="text-center text-red-500 text-lg font-medium">No events found.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {currentEvents.map((event: any) => {
            const bestImage = event.images?.sort((a: any, b: any) => b.width - a.width)[0];

            return (
              <div
                key={event.id}
                className="p-5 bg-white/80 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transform transition duration-300 border border-gray-200 backdrop-blur-md"
              >
                {bestImage && (
                  <img
                    src={bestImage.url}
                    alt={event.name}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{event.name}</h2>
                <p className="text-gray-600 mb-1">
                  📅{" "}
                  {new Date(event.dates.start.dateTime).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-gray-600 mb-1">
                  📍 {event._embedded?.venues?.[0]?.name || "Unknown Venue"}
                </p>
                <p className="text-gray-600">
                  🌍 {event._embedded?.venues?.[0]?.country?.name || "Unknown"}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            className="px-5 py-2 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            ← Previous
          </button>
          <span className="text-gray-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-5 py-2 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
