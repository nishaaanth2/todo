import { useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

type Todo = {
  id: number;
  text: string;
};

export default function Index() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false); // 👈 NEW

  // Load from localStorage on first mount
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
      setHasLoaded(true); // ✅ Only allow saving *after* loading
    }
  }, []);

  // Save to localStorage, but only after first load
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, hasLoaded]);

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo = { id: Date.now(), text: newTodo };
    setTodos([...todos, todo]);
    setNewTodo("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-6">
          <h1 className="text-2xl font-semibold mb-4">📝 My Local Todo List</h1>
          <div className="flex space-x-2 mb-6">
            <Input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a task..."
              className="flex-1"
            />
            <Button onClick={addTodo}>Add</Button>
          </div>
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li key={todo.id} className="border px-3 py-2 rounded bg-white text-sm">
                {todo.text}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
