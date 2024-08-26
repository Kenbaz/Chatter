"use client";

import { useState, useEffect, useRef, FC } from "react";
import { PostData } from "@/src/libs/contentServices";
import { postFuncs } from "@/src/libs/contentServices";
import { setLoading } from "../_store/loadingSlice";
import { setError, clearError } from "../_store/errorSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../_store/store";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/src/libs/firebase";
import { useRequireAuth } from "@/src/libs/useRequireAuth";


const SearchBar: FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PostData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [authorName, setAuthorName] = useState('');

  const dispatch = useDispatch();
  const { error } = useSelector((state: RootState) => state.error);
  const { isLoading } = useSelector((state: RootState) => state.loading);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { searchPosts } = postFuncs();

  const { user } = useRequireAuth();

  useEffect(() => {
    if (!user) return;

    const handleSearch = async () => {
      if (query.trim().length < 2) {
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

    const fetchAuthorName = async () => {
      const userDoc = await getDoc(doc(firestore, "Users", user.uid));
      if (userDoc.exists()) {
        setAuthorName(userDoc.data().fullname || "Anonymous");
      }
    };

    const debounceTimer = setTimeout(handleSearch, 300);

    fetchAuthorName();
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
    <div className="search-bar-container border outline-none relative w-full rounded-lg border-secondary z-50">
      {error && <p className="text-red-600">{error}</p>}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className=" w-full p-2 rounded-lg outline-none"
        />
      </div>
      {/* {isLoading && <div className="loading-indicator">Loading...</div>} */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="search-results-dropdown md:absolute w-full border border-t-0 rounded-t-sm dark:border-customGray1 rounded-b-lg dark:bg-customGray1 p-1"
        >
          {results.length > 0 ? (
            results.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <div className="search-result-item mb-2 dark:hover:bg-lightGray2 tracking-wide">
                  <small className="font-bold text-gray-400" dangerouslySetInnerHTML={{ __html: post.author }} />
                  <h3 dangerouslySetInnerHTML={{ __html: post.title }} />
                </div>
              </Link>
            ))
          ) : (
            <div className="no-results tracking-wide">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;