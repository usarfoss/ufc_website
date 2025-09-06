"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface CountryProperties {
  NAME?: string;
  name?: string;
  contributions?: number;
  oscs?: number;
  [key: string]: any;
}

interface CountryFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: any[];
  };
  properties: CountryProperties;
}

const GlobeComponent: React.FC = () => {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [hoverD, setHoverD] = useState<CountryFeature | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
        );
        const countriesData = await res.json();

        const countriesWithData: CountryFeature[] = countriesData.features.map(
          (country: any) => {
            const countryName =
              country.properties.NAME || country.properties.name || "";
            let contributions = 0;

            if (countryName === "United States") {
              contributions = Math.floor(Math.random() * 500000 + 2500000);
            } else if (countryName === "China") {
              contributions = Math.floor(Math.random() * 300000 + 1200000);
            } else if (countryName === "India") {
              contributions = Math.floor(Math.random() * 200000 + 800000);
            } else if (["Germany", "United Kingdom"].includes(countryName)) {
              contributions = Math.floor(Math.random() * 150000 + 500000);
            } else if (["Japan", "Canada", "France"].includes(countryName)) {
              contributions = Math.floor(Math.random() * 100000 + 300000);
            } else if (["Brazil", "Russia", "South Korea"].includes(countryName)) {
              contributions = Math.floor(Math.random() * 80000 + 200000);
            } else if (
              ["Netherlands", "Australia", "Sweden", "Switzerland", "Israel"].includes(countryName)
            ) {
              contributions = Math.floor(Math.random() * 60000 + 120000);
            } else if (
              ["Italy", "Spain", "Poland", "Singapore", "Norway", "Denmark"].includes(countryName)
            ) {
              contributions = Math.floor(Math.random() * 40000 + 80000);
            } else if (
              ["Ukraine", "Belgium", "Finland", "Austria", "Ireland"].includes(countryName)
            ) {
              contributions = Math.floor(Math.random() * 30000 + 50000);
            } else if (
              ["Czech Republic", "Portugal", "Hungary", "Romania"].includes(countryName)
            ) {
              contributions = Math.floor(Math.random() * 20000 + 30000);
            } else {
              contributions = Math.floor(Math.random() * 15000 + 5000);
            }

            return {
              ...country,
              properties: {
                ...country.properties,
                contributions,
                oscs: contributions,
              },
            } as CountryFeature;
          }
        );

        setCountries(countriesWithData);
      } catch (error) {
        console.error("Error loading countries data:", error);
        setCountries([]);
      }
    };

    fetchData();
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (!globeRef.current) return;

    let animationFrameId: number;
    const rotate = () => {
      const controls = globeRef.current?.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.6;
      }
      animationFrameId = requestAnimationFrame(rotate);
    };

    rotate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Color mapping
  const getColor = (contributions?: number): string => {
    if (!contributions) return "#000000";
    if (contributions >= 500000) return "#0B874F";
    if (contributions >= 200000) return "#2D8F5A";
    if (contributions >= 80000) return "#4A6741";
    if (contributions >= 30000) return "#F5A623";
    return "#E94B3C";
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Globe
        ref={globeRef}
        width={750}
        height={750}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundColor="rgba(0,0,0,0)"
        animateIn={true}
        polygonsData={countries as any[]}
        polygonAltitude={(d: any) => (d === hoverD ? 0.15 : 0.08)}
        polygonCapColor={(d: any) => getColor(d?.properties?.contributions)}
        polygonSideColor={() => "rgba(11, 135, 79, 0.2)"}
        polygonStrokeColor={() => "#0B874F"}
        polygonLabel={(d: any) => {
          const properties: CountryProperties = d?.properties ?? {};
          return `
            <div style="
              background: rgba(0, 0, 0, 0.95);
              padding: 16px;
              border-radius: 12px;
              color: #FFFFFF;
              border: 3px solid #4A90E2;
              font-family: 'Courier New', monospace;
              backdrop-filter: blur(15px);
              box-shadow: 0 0 30px rgba(74, 144, 226, 0.6), 0 0 60px rgba(74, 144, 226, 0.3);
              font-size: 14px;
              font-weight: bold;
              text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
              min-width: 200px;
            ">
              <div style="color: #F5A623; font-size: 16px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">
                ${properties.NAME || properties.name || "Unknown"}
              </div>
              <div style="color: #0B874F; font-size: 14px;">
                OSCs: ${properties.oscs?.toLocaleString() || "N/A"}
              </div>
              <div style="color: #4A90E2; font-size: 12px; margin-top: 4px; opacity: 0.8;">
                Annual Contributions
              </div>
            </div>
          `;
        }}
        onPolygonHover={(polygon: any | null) => setHoverD(polygon)}
        polygonsTransitionDuration={400}
      />
    </div>
  );
};

export default GlobeComponent;
