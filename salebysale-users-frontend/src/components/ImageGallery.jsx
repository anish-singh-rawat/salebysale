import { useState } from "react";

/**
 * ImageGallery
 * Props:
 *   images      – string[]  all images (base64 or URL)
 *   primaryImage – string   the primary image (optional, used as first if provided)
 *   height      – number    thumbnail height in px (default 180)
 *   showThumbs  – bool      show row of thumb strips below main image (default true)
 */
export default function ImageGallery({ images = [], primaryImage = null, height = 180, showThumbs = true }) {
  // Build ordered list: primary first, then rest deduped
  const all = primaryImage
    ? [primaryImage, ...images.filter((img) => img !== primaryImage)]
    : [...images];

  // dedupe (same data URL could appear twice)
  const unique = [...new Map(all.map((img) => [img, img])).values()];

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (unique.length === 0) {
    return (
      <div
        style={{
          height,
          backgroundColor: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          borderRadius: 8,
          color: "#94a3b8",
        }}
      >
        📷
      </div>
    );
  }

  const prev = (e) => {
    e?.stopPropagation();
    setActive((i) => (i - 1 + unique.length) % unique.length);
  };
  const next = (e) => {
    e?.stopPropagation();
    setActive((i) => (i + 1) % unique.length);
  };

  return (
    <>
      {/* Main image */}
      <div style={{ position: "relative", borderRadius: 8, overflow: "hidden" }}>
        <img
          src={unique[active]}
          alt={`Product image ${active + 1}`}
          style={{
            width: "100%",
            height,
            objectFit: "cover",
            display: "block",
            cursor: "zoom-in",
            transition: "opacity 0.15s",
          }}
          onClick={() => setLightbox(true)}
        />

        {/* Arrows — only if more than one image */}
        {unique.length > 1 && (
          <>
            <button
              onClick={prev}
              style={arrowStyle("left")}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={next}
              style={arrowStyle("right")}
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}

        {/* Counter badge */}
        {unique.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              backgroundColor: "rgba(0,0,0,0.55)",
              color: "#fff",
              borderRadius: 12,
              padding: "2px 8px",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {active + 1}/{unique.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbs && unique.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 6,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          {unique.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`thumb ${i + 1}`}
              onClick={() => setActive(i)}
              style={{
                width: 52,
                height: 52,
                objectFit: "cover",
                borderRadius: 6,
                flexShrink: 0,
                cursor: "pointer",
                border: i === active ? "2px solid var(--primary, #2563eb)" : "2px solid transparent",
                opacity: i === active ? 1 : 0.6,
                transition: "opacity 0.15s, border-color 0.15s",
              }}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Prev */}
          {unique.length > 1 && (
            <button onClick={prev} style={lightboxArrow("left")}>‹</button>
          )}

          <img
            src={unique[active]}
            alt="Full size"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 8,
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            }}
          />

          {/* Next */}
          {unique.length > 1 && (
            <button onClick={next} style={lightboxArrow("right")}>›</button>
          )}

          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            style={{
              position: "absolute",
              top: 16,
              right: 20,
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 32,
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ✕
          </button>

          {/* Counter */}
          {unique.length > 1 && (
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                background: "rgba(0,0,0,0.4)",
                padding: "4px 12px",
                borderRadius: 12,
              }}
            >
              {active + 1} / {unique.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function arrowStyle(side) {
  return {
    position: "absolute",
    top: "50%",
    [side]: 6,
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.45)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 28,
    height: 28,
    fontSize: 20,
    lineHeight: "28px",
    textAlign: "center",
    cursor: "pointer",
    padding: 0,
    zIndex: 1,
  };
}

function lightboxArrow(side) {
  return {
    position: "absolute",
    top: "50%",
    [side]: 16,
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 44,
    height: 44,
    fontSize: 30,
    lineHeight: "44px",
    textAlign: "center",
    cursor: "pointer",
    padding: 0,
    zIndex: 1,
  };
}
