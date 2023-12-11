import { useEffect, useState } from 'react'


function App() {
  // State for create-task mode: edit or create
  const [mode, setMode] = useState('create');
  // State for task filters: none, name, priority, date, completed
  const [filter, setFilter] = useState('none');

  // Looks for session storage; If no tasks found then two default tasks are set
  const storedTasksString = sessionStorage.getItem('tasks');
  const storedTasks = storedTasksString ? JSON.parse(storedTasksString) : [{id: 1, name:"Create a using the create task button", dateDue: "2023-12-07", priority: 0, completed: 0},
  {id: 2, name:"Delete a task", dateDue: "2023-12-07", priority: 0, completed: 0}];
  
  // State for tasks
  const [tasks, setTasks] = useState(storedTasks);

  // Wanted to implement creating own priorities (or extending functionality to categories), but ran out of time
  const [priorities, setPriorities] = useState([
    {id: 0, value: "None"},
    {id: 1, value: "Low"},
    {id: 2, value: "Medium"},
    {id: 3, value: "High"}
  ]);

  // Track create-task values
  const [newTask, setNewTask] = useState({priority: 0});
  const [date, setDate] = useState('');
  const [value, setValue] = useState('');
  const [editId, setEditId] = useState(-1);

  // If no value for name given, set name of task as untitled
  useEffect( () => {
    if (value == "") {
      setNewTask((prevTask) => ({ ...prevTask, name: "Untitled Task" }));
    }
  },[value])

  // Saves tasks in session storage, when tasks update
  useEffect(() => {
    sessionStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Toggles completed property for a task
  const handleCompleted = (id: number) => {
    const newTasks = tasks.map((task: any) => {
      if (task.id === id) {
        return { ...task, completed: task.completed === 0 ? 1 : 0 };
      }
      return task;
    });
    setTasks(newTasks);
  };

  // Handler for deleting task
  const handleDelete = (id: number) => {
    setTasks((prevTasks: any) =>
      prevTasks.map((task: any) =>
        task.id === id ? { ...task, isDeleting: true } : task
      )
    );
    
    // Matched timeout with CSS animation
    setTimeout(() => {
      setTasks((prevTasks: any) => prevTasks.filter((task: any) => task.id !== id));
    }, 700);
  };

  
  const handleNewTask = (property: any, value: any) => {
    setNewTask({...newTask, [property]: value})
  }

  // Creates a task
  const handleCreateTask =() => {
    const lastTask = tasks[tasks.length - 1];
    const newTaskId = { ...(newTask as any), id: lastTask ? lastTask.id + 1 : 1, completed: 0};
    setTasks([...(tasks as any), newTaskId]);
  }

  // Reset create-task values
  const handleResetCreateTask = () => {
    setNewTask({priority: 0});
    setValue('');
    setDate('');
  }

  const handleValue = (value: string) =>{
    setValue(value);
  }
  const handleDate = (date: string) =>{
    setDate(date);
  }

  // Changes into edit mode
  const handleEdit =(id: number) => {
    setMode('edit');
    setEditId(id);
    const editTask = tasks.find((task: any) => task.id === id)
    if (editTask !== undefined){
      const newEdit = {priority: editTask.priority}
      setNewTask(newEdit);
      setValue(editTask.name);
      setDate(editTask.dateDue);
    }
  }

  // Save edits from create-task inputs
  const handleEditTask = () => {
    const currentTask = tasks.find((task: any) => task.id === editId)
    if (currentTask !== undefined){
      const updatedTask = { ...(currentTask as any), ...newTask};
      setTasks((prevTasks: any[]) => prevTasks.map(task => (task.id === editId ? updatedTask : task)));
    }
    handleResetCreateTask();
    setMode('create');
  }

  // Applies filter to tasks
  var sortedTasks: any = [];
  if (filter === 'none'){
    sortedTasks = [...tasks]
  } else if (filter === 'priority'){
    sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority);
  } else if (filter === 'completed'){
    sortedTasks = [...tasks].sort((a, b) => b.completed - a.completed);
  } else if (filter === 'name'){
    sortedTasks = [...tasks].sort((a, b) => {return a.name.localeCompare(b.name);});
  } else if (filter === 'date'){
    sortedTasks = [...tasks].sort((a, b) => {
      if (!a.dateDue && !b.dateDue) return 0;
      // If date doesn't exist, sort them below tasks with dates
      if (!a.dateDue) return 1; 
      if (!b.dateDue) return -1; 
      return a.dateDue.localeCompare(b.dateDue);
    });
  }


  return (
      <div className="tasks">
        <div className="create-task">
          <input type="text" onChange={(e) => {
            handleNewTask("name", e.target.value); 
            handleValue(e.target.value)}} placeholder="Write your task here" value={value}></input>
          <select value={newTask.priority} onChange={(e) => handleNewTask("priority", parseInt(e.target.value))}>
            {priorities.map((priority: any) => (
                <option key={priority.id} value={priority.id}>{priority.value}</option>
            ))}
          </select>
          <input type="date" onChange={(e) => {handleNewTask("dateDue", e.target.value); handleDate(e.target.value)}} value={date} min="2020-01-01" max="2040-12-31"/>
          {mode === 'create' ? <button onClick={handleCreateTask}>Create a task</button> : <button onClick={handleEditTask}>Finish edit</button>}
          <button onClick={handleResetCreateTask}>Reset</button>
        </div>
        <div className="filters">
        <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="none">None</option>
            <option value="name">Name</option>
            <option value="priority">Priority</option>
            <option value="date">Date</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {sortedTasks.map((task: any) => (
          <div className={`task ${task.isDeleting ? 'fade-out' : ''}`} id={task.completed === 1 ? "completed" : ""} key={task.id}>
            <input type="checkbox" onChange={() => {handleCompleted(task.id)}}></input>
            <div id="name">{task.completed === 0 ? task.name : <s id="grayed">{task.name}</s>}</div>
            <div>{task.priority > 0 && priorities.filter(priority => priority.id === task.priority).map(tag => 
            (
              <div className={"tag"+tag.id /*id changes color of priority tag*/} key={tag.id}>{tag.value}</div>
            ))}
            </div>
            <div id="due">{task.completed === 0 ? (task.dateDue ? "Due: " + task.dateDue : "") : ""}</div>
            {task.completed === 0 && <button onClick={() => handleEdit(task.id)}>Edit task</button>}
            <button onClick={() => handleDelete(task.id)}>Delete task</button>
          </div>
        ))}
      </div>
  )
}

export default App
