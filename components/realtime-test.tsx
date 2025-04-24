"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function RealtimeTest() {
  const { user } = useAuth()
  const [events, setEvents] = useState<{ table: string; type: string; time: string }[]>([])

  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel("realtime-test")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
        },
        (payload) => {
          console.log("Realtime event:", payload)
          setEvents((prev) => [
            {
              table: payload.table,
              type: payload.eventType,
              time: new Date().toLocaleTimeString(),
            },
            ...prev.slice(0, 9), // Keep only the last 10 events
          ])
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Realtime Events</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground">No events yet. Make some changes to see realtime updates.</p>
        ) : (
          <div className="space-y-2">
            {events.map((event, i) => (
              <div key={i} className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <Badge>{event.table}</Badge>
                  <span className="ml-2">{event.time}</span>
                </div>
                <Badge
                  variant={event.type === "INSERT" ? "success" : event.type === "UPDATE" ? "warning" : "destructive"}
                >
                  {event.type}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
