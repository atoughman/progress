import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./App.module.scss";

function App() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDescription, setNewHabitDescription] = useState("");

  const addHabit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/habits", {
        name: newHabitName,
        description: newHabitDescription,
        doneToday: false,
        streak: 0,
      });
      setHabits([...habits, data]);
      setNewHabitName("");
      setNewHabitDescription("");
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  };

  const deleteHabit = async (habit) => {
    try {
      await axios.delete(`http://localhost:5000/habits/${habit.id}`);
      const updatedHabits = habits.filter((h) => h.id !== habit.id);
      setHabits(updatedHabits);
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const setMidNightTime = async () => {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0); // set to midnight

    const resetTime = todayMidnight.getTime();

    try {
      const response = await axios.put("http://localhost:5000/resetTime", {
        id: 1,
        timeStamp: resetTime.toString(),
      });
      console.log("Reset time updated successfully!");
    } catch (error) {
      console.error("Error updating reset time:", error.message);
    }
  };

  const resetHabits = async () => {
    try {
      const habitsData = await axios.get("http://localhost:5000/habits");
      const habits = await habitsData.data;

      const data = await axios.get("http://localhost:5000/resetTime");
      const resetTimeStamp = data.data.timeStamp;
      const currentTimestamp = Date.now();

      const timeDiff = currentTimestamp - resetTimeStamp; // calculate difference in milliseconds
      const diffHours = timeDiff / (1000 * 60 * 60); // calculate difference in hours

      if (diffHours >= 24) {
        const updatedHabits = habits.map((habit) => ({
          ...habit,
          streak: habit.doneToday ? habit.streak : 0,
          doneToday: false,
        }));
        setHabits(updatedHabits);
        for (let i = 0; i < updatedHabits.length; i++) {
          const habit = updatedHabits[i];
          await axios.put(`http://localhost:5000/habits/${habit.id}`, habit);
        }
        setMidNightTime();
      } else {
        setHabits(habits);
      }
    } catch (error) {
      console.error("Error resetting habits:", error.message);
    }
  };

  useEffect(() => {
    resetHabits();
  }, []);

  const handleClick = async (id) => {
    let updatedHabit = {};
    const updatedHabits = habits.map((habit) => {
      if (habit.id === id) {
        updatedHabit = {
          ...habit,
          doneToday: !habit.doneToday,
          streak: habit.doneToday ? habit.streak - 1 : habit.streak + 1,
        };
        return updatedHabit;
      } else {
        return habit;
      }
    });

    try {
      await axios.put(`http://localhost:5000/habits/${id}`, updatedHabit);
      setHabits([...updatedHabits]);
    } catch (error) {
      console.error("Error updating habit:", error.message);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={addHabit}>
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          className={styles.input}
          placeholder="Habit name"
        />
        <input
          type="text"
          value={newHabitDescription}
          onChange={(e) => setNewHabitDescription(e.target.value)}
          className={styles.input}
          placeholder="Habit description"
        />
        <button type="submit" className={styles.button}>
          Add Habit
        </button>
      </form>
      <ul className={styles.list}>
        {habits.map((habit) => (
          <li key={habit.id} className={styles.listItem}>
            <h2 className={styles.habitName}>{habit.name}</h2>
            <p className={styles.habitDescription}>{habit.description}</p>
            <p className={styles.habitStreak}>Streak: {habit.streak}</p>
            <button
              onClick={() => handleClick(habit.id)}
              className={styles.button}
            >
              {habit.doneToday ? "Mark as not Done" : "Mark as done"}
            </button>
            <button
              onClick={() => deleteHabit(habit)}
              className={styles.button}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
