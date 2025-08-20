import { useState } from 'react';

const MAX_LENGTH = 300;
type PromptResponse = { goal:string, tone:string, target_audience:string, 
                        steps_the_LLM_would_take:string[], suggested_improvements:string[] }

async function submitPrompt(prompt_: string): Promise<PromptResponse> {
  // send the prompt to the backend 
  const res = await fetch("http://localhost:3000/api/promptDebug", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt : prompt_ }),
  });
  const data: {response: string} = await res.json(); // get the backend response
  console.log(data.response);
  return JSON.parse(data.response);
}


export default function App() {
  const [responseText, setResponse] = useState<string>("Your prompt breakdown will appear here...");
  const [promptText, setPromptText] = useState<string>("");

  // API call
  const handleSubmit = async (value: string) => {
    setResponse("Processing and breaking down your prompt.");
    const response = await submitPrompt(value);
   
    const formatList = (list: string[]) => {
      let content = ''
      for (let i=0; i < list.length; i++) {
        content += `  ${i+1}. ${list[i]}\n`
      }
      return content.trimEnd();
    };
    
    const formattedRes = `Here is how an LLM would break down your prompt of:
${promptText}
----------------------
Goal: ${response.goal}
----------------------
Tone: ${response.tone}
----------------------
Target Audience: ${response.target_audience}
----------------------
Steps the LLM would take:
${formatList(response.steps_the_LLM_would_take)}
----------------------
Suggested Improvements: 
${formatList(response.suggested_improvements)}`;
    setResponse(formattedRes);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const value = promptText.trim();
    if (e.key === 'Enter' && !e.shiftKey && value !== '') {
      e.preventDefault(); // prevents newline from being added

      // call the api
      handleSubmit(value);
      setPromptText("");

    } else if (e.key === 'Enter' && value === '') { // prevent newline when textbox is empty
      e.preventDefault(); 
      setPromptText("");
    }
  };

  return (
  <>
    <div className="flex h-screen justify-center items-center">
      <div className="content-between">
        <div className="place-self-center border border-black bg-purple-700/70 rounded p-2 
            text-white w-4xl h-112 mb-8 overflow-y-auto text-lg">
          <pre className='text-wrap'>{responseText}</pre>
        </div>
        <textarea className="resize-none w-4xl h-24 shadow-xs shadow-black border border-gray-300 
            rounded-xl pl-2 pt-1 mb-2 outline-none bg-white text-lg overflow-y-auto" 
            placeholder="Breakdown a prompt" onKeyDown={handleKeyDown} value={promptText} 
            onChange={handlePromptChange} maxLength={300}/>
        <p className="text-sm text-white -mt-2 place-self-end">{promptText.length} / {MAX_LENGTH} characters</p>
      </div>
    </div>
  </>
  );
}
