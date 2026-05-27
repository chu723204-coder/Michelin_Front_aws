import React, { useEffect, useState } from "react";
import RestaurantMapContainer from "../components/restaurant/RestaurantMapContainer";
import { useNavigate } from "react-router-dom";
import { getRestaurantMarkers, searchRestaurantsByName } from "../service/restaurantApi";
import type { IRestaurantMarker } from "../types/IRestaurant";
import { useT } from "../hooks/useT";

const gradeLabel = (grade: string) => {
  if (grade === '3스타') return '★★★ 3 STARS'
  if (grade === '2스타') return '★★ 2 STARS'
  if (grade === '1스타') return '★ 1 STAR'
  if (grade === '빕 구르망') return 'BIB GOURMAND'
  return 'SELECTED'
}

const gradeColor = (grade: string) => {
  if (grade === '1스타' || grade === '2스타' || grade === '3스타') return '#DAA520'
  if (grade === '빕 구르망') return '#22C55E'
  return '#2563EB'
}

const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (meters: number): string | null => {
  if (meters > 50000) return null;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=200";

const CATEGORY_MAP = [
  { value: "전체",   key: "category_all"      },
  { value: "한식",   key: "category_korean"   },
  { value: "일식",   key: "category_japanese" },
  { value: "중식",   key: "category_chinese"  },
  { value: "양식",   key: "category_western"  },
  { value: "아시안", key: "category_asian"    },
] as const;

const RestaurantPage = () => {
  const { t } = useT();
  const [restaurants, setRestaurants] = useState<IRestaurantMarker[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<IRestaurantMarker[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 35.1437, lng: 129.0536 });
  const [fetchLocation, setFetchLocation] = useState({ lat: 35.1437, lng: 129.0536 })
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const filteredRestaurants = restaurants.filter((res) => {
    const normalizedName = res.restaurantName.replace(/\s+/g, "").toLowerCase();
    const normalizedSearch = searchTerm.replace(/\s+/g, "").toLowerCase();
    const isNameMatch = normalizedName.includes(normalizedSearch);
    const isCategoryMatch = selectedCategory === "전체" || res.category === selectedCategory;
    return isNameMatch && isCategoryMatch;
  });

  const selectedRestaurant = restaurants.find((r) => r.id === selectedId);

  const distanceLabel = (res: IRestaurantMarker): string | null => {
    if (!userLocation) return null;
    const d = getDistance(userLocation.lat, userLocation.lng, res.lat, res.lng);
    return formatDistance(d);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setMapCenter({ lat, lng });
          setFetchLocation({ lat, lng });
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    if (!isSearching) {
      getRestaurantMarkers(fetchLocation.lat, fetchLocation.lng)
        .then((response) => { setRestaurants(response.data); });
    }
  }, [fetchLocation, isSearching]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length > 0) {
      const filtered = restaurants
        .filter((r) => r.restaurantName.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (targetName?: string) => {
    const query = typeof targetName === "string" ? targetName : searchTerm;
    if (!query.trim()) { setIsSearching(false); return; }
    try {
      setIsSearching(true);
      const response = await searchRestaurantsByName(query);
      setRestaurants(response.data);
      setShowSuggestions(false);
    } catch (error) {
      console.error("검색 실패:", error);
      alert(t("error_search"));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleImageClick = (id: number) => {
    navigate(`/restaurants/${id}`);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert(t("error_location_unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setMapCenter(loc);
        setFetchLocation(loc);
        setIsSearching(false);
      },
      () => alert(t("error_location_denied")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "calc(100vh - 57px)", overflow: "hidden" }}>
      <div style={{ width: "100%", height: "100%", zIndex: 1 }}>
        <RestaurantMapContainer
          restaurants={filteredRestaurants}
          selectedId={selectedId}
          onSelect={(id: number) => {
            setSelectedId(id);
            setIsSidebarOpen(true);
            const selected = restaurants.find((r) => r.id === id);
            if (selected) {
              setMapCenter({ lat: selected.lat, lng: selected.lng });
              setFetchLocation({ lat: selected.lat, lng: selected.lng });
            }
          }}
          onCenterChange={(newCenter: { lat: number; lng: number }) => {
            if (!isSearching) setFetchLocation(newCenter);
          }}
          center={mapCenter}
          userLocation={userLocation}
        />
      </div>

      {/* ✅ 현위치 버튼 - 챗봇과 동일한 52x52 */}
      <button
        onClick={handleLocate}
        title={t("map_locate_title")}
        style={{
          position: "absolute",
          bottom: "84px",
          right: "20px",
          zIndex: 200,
          width: "52px", height: "52px", // ✅ 챗봇 버튼과 동일
          background: "#fff", border: "1px solid #ddd",
          borderRadius: "0", cursor: "pointer",
          color: "#2563EB",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "20px",
          transition: "background 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
      >
        ◎
      </button>

      <div
        style={{
          position: "absolute", top: 0, left: 0, width: "400px", height: "100%",
          backgroundColor: "white", zIndex: 100,
          boxShadow: "5px 0 15px rgba(0,0,0,0.1)",
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-400px)",
          transition: "transform 0.3s ease", display: "flex", flexDirection: "column",
          fontFamily: "'Space Mono', 'Pretendard Variable', Pretendard, sans-serif",
        }}
      >
        <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "9px", letterSpacing: "3px", color: "#e62117", margin: "0 0 4px" }}>
              ● MICHELIN GUIDE
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.8rem", letterSpacing: "-1px", color: "#111", margin: 0 }}>
              MICHELIN MAP
            </h2>
          </div>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="SEARCH RESTAURANTS"
              style={{
                width: "100%", padding: "10px", borderRadius: "0",
                border: "1px solid #ddd", fontFamily: "'Space Mono', monospace",
                fontSize: "0.65rem", letterSpacing: "1px", boxSizing: "border-box",
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul style={{
                position: "absolute", top: "100%", left: 0, right: 0,
                backgroundColor: "white", border: "1px solid #ccc",
                zIndex: 1000, listStyle: "none", padding: 0, margin: 0,
              }}>
                {suggestions.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => { setSearchTerm(s.restaurantName); handleSearch(s.restaurantName); }}
                    style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee", fontSize: "12px" }}
                  >
                    {s.restaurantName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "15px" }}>
            {CATEGORY_MAP.map(({ value, key }) => (
              <button
                key={value}
                onClick={() => { setSelectedCategory(value); setIsSearching(false); }}
                style={{
                  padding: "4px 10px",
                  border: `0.5px solid ${selectedCategory === value ? '#111' : '#ddd'}`,
                  background: selectedCategory === value ? '#111' : 'transparent',
                  color: selectedCategory === value ? '#fff' : '#888',
                  cursor: "pointer", fontSize: "10px", letterSpacing: "1px",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {t(key)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingBottom: "20px" }}>
          {selectedRestaurant ? (
            <div style={{ padding: "20px", animation: "fadeIn 0.3s" }}>
              <div
                onClick={() => handleImageClick(selectedRestaurant.id)}
                style={{ width: "100%", height: "200px", background: "#eee", marginBottom: "15px", overflow: "hidden", cursor: "pointer" }}
              >
                <img
                  src={selectedRestaurant.imageUrl || FALLBACK_IMAGE}
                  alt={t("map_restaurant_image_alt")}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease", filter: "grayscale(1)", opacity: 0.8 }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.filter = "grayscale(0)"; e.currentTarget.style.opacity = "1"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "grayscale(1)"; e.currentTarget.style.opacity = "0.8"; }}
                />
              </div>

              <h1 style={{ fontSize: "1.2rem", marginBottom: "10px", fontFamily: "'Playfair Display', serif", letterSpacing: "-0.5px" }}>
                {selectedRestaurant.restaurantName}
              </h1>

              <div style={{ marginBottom: "15px" }}>
                <span style={{ display: "inline-block", border: `1px solid ${gradeColor(selectedRestaurant.grade)}`, color: gradeColor(selectedRestaurant.grade), fontSize: "8px", letterSpacing: "1.5px", padding: "2px 8px", marginRight: "8px" }}>
                  {gradeLabel(selectedRestaurant.grade)}
                </span>
                <span style={{ color: "#888", fontSize: "11px" }}>
                  {selectedRestaurant.category}
                  {distanceLabel(selectedRestaurant) && ` · ${distanceLabel(selectedRestaurant)}`}
                </span>
              </div>

              <div style={{ fontSize: "10px", lineHeight: "2", letterSpacing: "1px", color: "#555" }}>
                <p style={{ margin: "4px 0" }}>{t("map_address")} · {selectedRestaurant.address || "-"}</p>
                <p style={{ margin: "4px 0" }}>{t("map_phone")} · {selectedRestaurant.phone || "-"}</p>
              </div>

              <button
                onClick={() => handleImageClick(selectedRestaurant.id)}
                style={{ width: "100%", padding: "12px", marginTop: "12px", border: "none", backgroundColor: "#e62117", color: "white", cursor: "pointer", fontWeight: "bold", fontSize: "10px", letterSpacing: "2px", fontFamily: "'Space Mono', monospace" }}
              >
                {t("map_view_detail")}
              </button>
              <button
                onClick={() => setSelectedId(null)}
                style={{ width: "100%", padding: "12px", marginTop: "8px", border: "0.5px solid #ddd", cursor: "pointer", fontWeight: "bold", fontSize: "10px", letterSpacing: "2px", fontFamily: "'Space Mono', monospace", background: "transparent", color: "#111" }}
              >
                {t("map_back_to_list")}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ padding: "10px 20px", borderBottom: "0.5px solid #eaeaea", fontSize: "9px", letterSpacing: "2px", color: "#aaa", fontFamily: "'Space Mono', monospace" }}>
                {filteredRestaurants.length} RESTAURANTS
              </div>
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => { setSelectedId(res.id); setMapCenter({ lat: res.lat, lng: res.lng }); }}
                    style={{ display: "flex", gap: "12px", padding: "12px 20px", borderBottom: "0.5px solid #eaeaea", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: "60px", height: "60px", flexShrink: 0, background: "#eee", overflow: "hidden" }}>
                      <img
                        src={res.imageUrl || FALLBACK_IMAGE}
                        alt={res.restaurantName}
                        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.3)" }}
                        onError={e => { if (e.currentTarget.dataset.errored) return; e.currentTarget.dataset.errored = 'true'; e.currentTarget.src = FALLBACK_IMAGE }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", color: "#111", marginBottom: "6px", fontWeight: 500 }}>
                        {res.restaurantName}
                      </div>
                      <div style={{ fontSize: "9px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{ color: gradeColor(res.grade), border: `0.5px solid ${gradeColor(res.grade)}`, padding: "1px 5px", letterSpacing: "1px" }}>
                          {gradeLabel(res.grade)}
                        </span>
                        <span style={{ color: "#aaa" }}>{res.category}</span>
                        {distanceLabel(res) && (
                          <><span style={{ color: "#ddd" }}>·</span><span style={{ color: "#888" }}>{distanceLabel(res)}</span></>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: "50px 0", textAlign: "center", color: "#bbb", fontSize: "10px", letterSpacing: "3px" }}>NO RESULTS</div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ position: "absolute", right: "-30px", top: "50%", transform: "translateY(-50%)", width: "30px", height: "60px", backgroundColor: "white", border: "0.5px solid #ddd", borderLeft: "none", cursor: "pointer", color: "#e62117", fontSize: "10px" }}
        >
          {isSidebarOpen ? "◀" : "▶"}
        </button>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
};

export default RestaurantPage;