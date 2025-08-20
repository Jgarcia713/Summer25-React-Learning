import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient';


type Note = { id?: string; title: string; content: string; created_at?: string };
type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

/** 
* Side bar for selecting a different note or creating a new note.
*/
function NoteSelection({notes, setNote, isSidebarOpen, setSidebar, setNoteIndex, noteIndex}: 
    {notes: Note[], setNote:SetState<Note[]>, isSidebarOpen: boolean, 
      setSidebar:SetState<boolean>, setNoteIndex:SetState<number>, noteIndex:number}) {
  const barVis = isSidebarOpen ? "translate-x-0 pointer-events-auto" : "translate-x-[-100%] pointer-events-none";
  const opacity = isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none";
 
  const handleNewNote = () => {
    const newNote: Note = {
      title: "Untitled Note",
      content: "",
    };
    setNote((prevNotes) => [newNote, ...prevNotes]);
    setNoteIndex(0); // Select the new note
    setSidebar(false);
  };


  return (
    <>
      {/* Note opacity */}
      <div className={`top-0 left-0 h-full w-full fixed ${opacity} cursor-pointer transition-opacity`} 
          onClick={() => setSidebar(!isSidebarOpen)}>
        <div className="h-screen bg-black opacity-40 flex"></div>
      </div>

      {/* Sidebar panel for other notes (slides left to right) */}
      <div className={`top-0 left-0 h-full w-1/3 fixed ${barVis} transition-transform`}>
        <div className="h-screen bg-stone-200 flex flex-col overflow-y-auto">
          <p className='text-xl mt-2 mb-4 place-self-center'>My Notes</p>

          {/* New Note Button */}
          <button
            onClick={handleNewNote}
            className="mx-4 mb-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600">
            + New Note
          </button>
          
          {/* Note boxes. Upon clicking a different note, the side bar closes*/}
          {notes.map((note:{id?:string, title:string, content:string, created_at?:string}, i:number) => (
            <div className={`w-full pb-2 ${noteIndex==i ? 'bg-zinc-300 cursor-default' : 'hover:bg-zinc-300 cursor-pointer'}`} 
                id={i+''} key={i} onClick={() => {setNoteIndex(i); setSidebar(!isSidebarOpen);}}>
              <hr/>
              <p className='pl-4 pr-4 text-lg truncate'>{note.title}</p>
              <p className='pl-4 pr-4 text-sm truncate'>{note.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/** 
* Button for opening and closing the sidebar
*/
function HamburgerMenu({isSidebarOpen, setSideBar }: { isSidebarOpen: boolean, setSideBar: SetState<boolean>}) {
  const handleNextNote = () => {
    setSideBar(!isSidebarOpen);
  };

  const buttonClassName = `z-10 absolute left-4 top-1 rounded-md border-4 p-1 transition-transform cursor-pointer
    ${isSidebarOpen ? "bg-zinc-400 border-zinc-400 rotate-90" : "bg-stone-200 border-stone-200"}`;
  
  return (
    <button onClick={handleNextNote}
      id='menu'
      className={buttonClassName}>
      <div className="grid justify-items-center gap-1">
        <span className={`h-1 w-5 rounded-full ${isSidebarOpen ? "bg-stone-200" : "bg-zinc-400"}`}></span>
        <span className={`h-1 w-5 rounded-full ${isSidebarOpen ? "bg-stone-200" : "bg-zinc-400"}`}></span>
        <span className={`h-1 w-5 rounded-full ${isSidebarOpen ? "bg-stone-200" : "bg-zinc-400"}`}></span>
      </div>
    </button>
  );
}

/** 
* The main display of the web app. Shows the current selected note.
*/
function DisplayNote({notes, noteIndex, setNote, setNoteIndex}:
    {notes:Note[], noteIndex:number, setNote:SetState<Note[]>, setNoteIndex:SetState<number>}) {
  const note = notes[noteIndex];
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  // Load the selected note into state when noteIndex changes
  useEffect(() => {
    setTitle(notes[noteIndex]?.title || '');
    setContent(notes[noteIndex]?.content || '');
  }, [noteIndex, notes]);

  // Save the notes when the "save" button is hit
  const handleSave = () => {
    setNote(prevNotes => {
      let oldNotes = [...prevNotes];
      const note =  { ...oldNotes[noteIndex], title, content };
      oldNotes.splice(noteIndex, 1);
      const newNotes = [note, ...oldNotes];
      // Save the new notes to Supabase
      async function saveNotes(newNotes: Note[]) {
        const existingNotes = newNotes.filter(note => note.id);
        const newNotesOnly = newNotes.filter(note => !note.id);

        if (existingNotes.length > 0) {
          await supabase.from('notes').upsert(existingNotes);
        }

        if (newNotesOnly.length > 0) {
          await supabase.from('notes').insert(newNotesOnly);
        }
      }
      saveNotes(newNotes);
      return newNotes;
    });
    setNoteIndex(0);

  };

  return (
    <>
      <header>
        <div className="relative flex items-center justify-between w-[calc(100vw-32px)] h-12 ml-4 mr-4 bg-red-500 border-b-1">
          {/* div used to justify items in proper positions */}
          <div /> 

          {/* Title */}
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
              className="text-white font-bold text-center w-200 truncate"></input>
          <button className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm w-[80px] text-center"
              onClick={handleSave}>
            Save
          </button>
        </div>
      </header>
      {/* Notes section */}
      <textarea value={content} onChange={(e) => setContent(e.target.value)}
          className="ml-14 bg-blue-500 w-[calc(100vw-112px)] h-[calc(99vh-48px)] resize-none"></textarea>
    </>
  );
}

/** 
* Load in data from Supabase
*/
async function loadNotes() {
  const { data, error } = await supabase.from('notes').select('*');
  if (error) {
    console.error('Error loading notes:', error.message);
    return [];
  }

  return data as Note[];
}


export default function App() {  
  const [notes, setNote]:[Note[], SetState<Note[]>] = useState<Note[]>([{id:"", title:"", content:"", created_at:""}]);
  const [noteIndex, setNoteIndex]:[number, SetState<number>] = useState(0); // Selected note
  const [isSidebarOpen, setSidebar]:[boolean, SetState<boolean>] = useState(false);

  // Load the Supabase data
  useEffect(() => {
    async function fetchNotes() {
      const loadedNotes = await loadNotes();
      setNote(loadedNotes);
    }
    fetchNotes();
  }, []);
 
  return (
    <>
      <HamburgerMenu isSidebarOpen={isSidebarOpen} setSideBar={setSidebar} />
      <DisplayNote notes={notes} noteIndex={noteIndex} setNote={setNote} setNoteIndex={setNoteIndex} />
      <NoteSelection notes={notes} setNote={setNote} isSidebarOpen={isSidebarOpen} 
          setSidebar={setSidebar} setNoteIndex={setNoteIndex} noteIndex={noteIndex} />      
    </>
  )
}


