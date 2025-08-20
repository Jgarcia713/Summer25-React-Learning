import { useRef, useState } from 'react';
import { supabase } from './supabaseClient';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

function LogInPanel() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null); 
  const [showPass, setPassVis] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // focus on password box when enter is hit on the username box
  const handleUsernameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value.trim();
    if (event.key === 'Enter' && value !== '') {
      passwordRef.current?.focus();
    }
  };

  // log in when enter is pressed on the password box
  const handlePasswordKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value.trim();
    if (event.key === 'Enter' && value !== '') {
      logIn();
    }
  };

  // modify visibility of the password box
  const updateCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassVis(event.currentTarget.checked);
  };

  const signUp = async () => {
    const username = usernameRef.current?.value.trim() || '';
    const password = passwordRef.current?.value || '';

    if (!username || !password) {
      setMessage("Please enter both username and password.");
      return;
    }
    const email = `${username}@myapp.fake`; 

    const { data, error } = await supabase.auth.signUp({ email, password });

    console.log(data);
    console.log(error);

    if (!error) {
      console.log("user signed up");
      setMessage(null); // Clear any previous error
      navigate('/'); // move to home page
    } else {
      setMessage("Password weak or username taken");
    }
  };

  // handle logging in
  const logIn = async () => {
    const username = usernameRef.current?.value.trim() || '';
    const password = passwordRef.current?.value || '';

    if (!username || !password) {
      setMessage("Please enter both username and password.");
      return;
    }
    const email = `${username}@myapp.fake`; 

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    console.log(data);
    console.log(error);

    if (!error) {
      console.log("user logged in");
      setMessage(null); // Clear any previous error
      navigate('/'); // move to home page
    } else {
      setMessage("Incorrect username or password.");
    }
  };

  return (
    <>
      <div className="flex h-screen justify-center items-center">
        <div className="border rounded-sm border-blue-300 bg-green-200 p-10 shadow-md space-y-3">
          {/* username box */}
          <div className="flex">
            <label className='text-xl w-32 select-none' htmlFor="username">Username: </label>
            <input type="text" className="bg-white border rounded-sm px-2 py-1" 
                id="username" onKeyDown={handleUsernameKeyDown} ref={usernameRef}/>
          </div>
          
          {/* password box */}
          <div className="flex">
            <label className="text-xl w-32 select-none" htmlFor="password">Password: </label>
            <input type={showPass ? "text" : "password"} className="bg-white border rounded-sm px-2 py-1" 
                id="password" ref={passwordRef} onKeyDown={handlePasswordKeyDown}/>
          </div>
          
          {/* show password box */}
          <div className='flex'>
            <input type="checkbox" className='mr-2' id="showPass" onChange={updateCheck}/>
            <label htmlFor='showPass' className='select-none'>Show password</label>
          </div>
          
          {/* Log in/sign up */}
          <button className="w-full bg-blue-500 text-white rounded-md py-1 hover:bg-blue-400" onClick={signUp}>Sign up</button>
          <button className="w-full bg-gray-300 rounded-md py-1 hover:bg-gray-400" onClick={logIn}>Log in</button>
          
          {/* Failed log in/sign up message */}
          {message && <p className="text-red-600">{message}</p>}
        </div>
      </div>
    </>
  );
}

function Home() {
  return (
    <>
      <h1>Home Page</h1>
      <button className="w-full bg-gray-300 rounded-md py-1 hover:bg-gray-400" onClick={() => supabase.auth.signOut()}>Sign out</button>
    </>);
}

export default function App() {

  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path='/' element={ <ProtectedRoute ><Home /></ProtectedRoute>} />
            <Route path='/login' element={<LogInPanel/>} />
         </Routes>
        </Router>
     </AuthProvider>
    </>
  )
}

