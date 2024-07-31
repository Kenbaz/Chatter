"use client";

import { useState, useEffect, useRef, FC } from "react";
import { PostData } from "@/src/libs/contentServices";
import { postFuncs } from "@/src/libs/contentServices";
import { setLoading } from "../_store/loadingSlice";
import { setError, clearError } from "../_store/errorSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../_store/store";
import Link from "next/link";

const SearchBar: FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PostData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const dispatch = useDispatch();
  const { error } = useSelector((state: RootState) => state.error);
  const { isLoading } = useSelector((state: RootState) => state.loading);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { searchPosts } = postFuncs();

  useEffect(() => {
    const handleSearch = async () => {
      if (query.trim() === "") {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      dispatch(setLoading(true));
      try {
        const searchResults = await searchPosts(query);
        setResults(searchResults);
        setShowDropdown(true);
        dispatch(clearError());
      } catch (error) {
        dispatch(setError("Search failed. Try again"));
        console.error("Error searching posts:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    const debounceTimer = setTimeout(handleSearch, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="search-bar-container">
      {error && <p className="text-red-600">{error}</p>}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts..."
        className="search-input"
      />
      {isLoading && <div className="loading-indicator">Loading...</div>}
      {showDropdown && (
        <div ref={dropdownRef} className="search-results-dropdown">
          {results.length > 0 ? (
            results.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <div className="search-result-item">
                  <h3>{post.title}</h3>
                  <p>{post.content.substring(0, 50)}...</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-results">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;