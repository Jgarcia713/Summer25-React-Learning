import { useState } from 'react'
import './App.css'

type Todo = { task: string; finished: boolean };
type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

/** 
 * Create input text box 
*/
function Input({state, setState} : {state:Todo[], setState:SetState<Todo[]>}) {
  const [newTask, setNewTask] = useState('');

  function TextHandler(event: { key: string; }) {
    // Add new todo item to the list
    if (event.key == 'Enter' && newTask != "") {
      setState([...state, {task: newTask, finished: false}]);
      setNewTask('');
    }
  }

  return (
    <>
      <label htmlFor='newItem'>New Item:</label>
      <input 
        type='text' 
        id='newItem' 
        value={newTask} 
        onChange={(e) => setNewTask(e.target.value)} 
        onKeyDown={TextHandler}></input>
    </>
  );
}

function ListItems({state, setState} : {state:Todo[], setState:SetState<Todo[]>}) {
  // display the todo list
  function UpdateCheck(i:number) {
    // update the check box icon that is displayed
    const updatedState = state.map((item, index) => {
      if (index === i) {
        return { ...item, finished: !item.finished };
      }
      return item;
    });
    setState(updatedState);
  }

  return (
    <ul id='todoList'>
      {state.map((item:{finished: boolean; task: string;}, i:number) => (
        <li key={i}>
          <div onClick={() => UpdateCheck(i)} className='listItems'>
            <input type="checkbox" id={i + ''} checked={item.finished} onChange={() => UpdateCheck(i)}></input>
            {item.task}
          </div>
        </li>
      ))}
    </ul>
  );
}

function ClearButton({state, setState} : {state:Todo[], setState:SetState<Todo[]>}) {
  function ClearFinished() {
    let newState = [];
    for (let item of state) {
      if (!item.finished)
        newState.push(item);
    }
    setState(newState);
  }

  return (<button onClick={ClearFinished} id='clear'>Clear Finished Items</button>);
}

export default function MyApp() {
  let items = [{task:'Create an array', finished:false}, 
               {task:'Finish this program', finished:false}, 
               {task:'Plan next program', finished:false}];

  const [state, setState]:[Todo[], SetState<Todo[]>] = useState(items);

  return (
    <div>
      <h1>Welcome to my TODO list app!</h1>
      <Input state={state} setState={setState}/>
      <ClearButton state={state} setState={setState}/>
      <ListItems state={state} setState={setState}/>
    </div>
  );
}
