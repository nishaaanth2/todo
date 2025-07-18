import { useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { cn } from "../lib/utils";

type Todo = {
  id: number;
  text: string;
  type: "routine" | "oneTime";
  daysOfWeek?: string[];
  allocatedMins: number;
  completed?: boolean;
  running?: boolean;
  startedAt?: number | null;
};

export default function Index() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [type, setType] = useState<"routine" | "oneTime">("oneTime");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(15);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("todos");
      if (stored) {
        try {
          setTodos(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse todos:", e);
        }
      }
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, hasLoaded]);

  useEffect(() => {
    const interval = setInterval(() => {
      const anyRunning = todos.some((t) => t.running && t.startedAt);
      if (anyRunning) {
        setNow(Date.now());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [todos]);

  useEffect(() => {
    todos.forEach((todo) => {
      if (todo.running && todo.startedAt && !todo.completed) {
        const elapsed = (now - todo.startedAt) / 1000;
        const total = todo.allocatedMins * 60;
        if (elapsed >= total) {
          new Audio("/alarm.mp3").play();
          setTodos((prev) =>
            prev.map((t) =>
              t.id === todo.id
                ? { ...t, completed: true, running: false, startedAt: null }
                : t
            )
          );
        }
      }
    });
  }, [now]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const totalMins = hours * 60 + minutes;

  const getProgress = (todo: Todo) => {
    if (!todo.startedAt) return 0;
    const elapsed = (now - todo.startedAt) / 1000;
    const total = todo.allocatedMins * 60;
    return Math.min((elapsed / total) * 100, 100);
  };

  const startTimer = (id: number) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, startedAt: Date.now(), running: true, completed: false }
          : t
      )
    );
    setNow(Date.now());
  };

  const stopTimer = (id: number) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, running: false, startedAt: null } : t
      )
    );
  };

  const finishTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, running: false, completed: true, startedAt: null }
          : t
      )
    );
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    if (type === "routine" && selectedDays.length === 0) {
      alert("Please select at least one day for routine tasks.");
      return;
    }
    if (totalMins < 5 || totalMins > 720) {
      alert("Time must be between 5 minutes and 12 hours.");
      return;
    }

    const todo: Todo = {
      id: Date.now(),
      text: newTodo,
      type,
      daysOfWeek: type === "routine" ? selectedDays : undefined,
      allocatedMins: totalMins,
      completed: false,
      running: false,
      startedAt: null,
    };

    setTodos([...todos, todo]);
    setNewTodo("");
    setHours(0);
    setMinutes(15);
    setSelectedDays([]);
    setType("oneTime");
  };

  const clearTodos = () => {
    localStorage.removeItem("todos");
    setTodos([]);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted py-10">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold mb-2">📝 My Local Todo List</h1>

          <div className="flex gap-4 text-sm">
            {['oneTime'].map((val) => (
            // {['oneTime', 'routine'].map((val) => (
              <label key={val} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={val}
                  checked={type === val}
                  onChange={() => setType(val as "routine" | "oneTime")}
                />
                {val === 'oneTime' ? 'One-Time' : 'Routine'}
              </label>
            ))}
          </div>

          {type === "routine" && (
            <div className="flex flex-wrap gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <Button
                  key={day}
                  variant={selectedDays.includes(day) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDay(day)}
                >
                  {day}
                </Button>
              ))}
            </div>
          )}

          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a task..."
          />

          <div className="text-sm">
            <label className="block mb-1">Allocated Time</label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                max={12}
                value={hours}
                onChange={(e) =>
                  setHours(Math.min(12, Math.max(0, parseInt(e.target.value) || 0)))
                }
                placeholder="Hours"
              />
              <Input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) =>
                  setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
                }
                placeholder="Minutes"
              />
            </div>
            <p className="text-xs mt-1 text-muted-foreground">
              Total: {totalMins} minutes
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={addTodo}>Add</Button>
            <Button variant="destructive" onClick={clearTodos}>
              Clear All
            </Button>
          </div>

          <ul className="space-y-4">
            {todos.map((todo) => {
              const progress = getProgress(todo);
              const minsLeft = Math.max(
                0,
                todo.allocatedMins - Math.floor(((now - (todo.startedAt ?? 0)) / 1000) / 60)
              );
              return (
                <li key={todo.id} className="bg-white border rounded p-3 shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-semibold">{todo.text}</h2>
                      <p className="text-xs text-gray-500">
                        {todo.type === "routine"
                          ? `Routine: ${todo.daysOfWeek?.join(", ")}`
                          : "One-Time Task"}
                        
                        • {Math.floor(todo.allocatedMins / 60)}h {todo.allocatedMins % 60}m
                        {todo.running && ` • ${minsLeft}m left`}
                      </p>
                    </div>
                    <div className="space-x-1">
                      {!todo.completed && (
                        <>
                          {!todo.running ? (
                            <Button size="sm" onClick={() => startTimer(todo.id)}>
                              Start
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => stopTimer(todo.id)}>
                              Stop
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => finishTodo(todo.id)}>
                            Finish
                          </Button>
                        </>
                      )}
                      {todo.completed && (
                        <span className="text-green-600 font-semibold text-sm">✔ Done</span>
                      )}
                    </div>
                  </div>
                  {todo.running && (
                    <Progress value={progress} className="mt-2" />
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
