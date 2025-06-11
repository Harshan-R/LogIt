// components/insights/InsightsCard.tsx

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function InsightsCard() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights");
      const json = await res.json();
      if (json.summary) {
        setSummary(json.summary);
      } else {
        setError("No insights available.");
      }
    } catch (err) {
      setError("Failed to load insights.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <Card className="w-full max-w-6xl mx-auto mt-10">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">🧠 AI Insights Summary</h2>
          <Button onClick={fetchInsights} disabled={loading}>
            {loading ? "Refreshing..." : "Regenerate"}
          </Button>
        </div>

        {loading ? (
          <Skeleton className="w-full h-28" />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
            {summary}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
