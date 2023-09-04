
export default function TextAndLabel({text,label}:{text:string,label:string}) {
      if( !isNaN(Number(text)))
      text=Number(text).toFixed(2);
    
  
    //if label has two words but each word on one line
    return (
    <div className="flex flex-col gap-4">
      <div>
        {
          label.split(" ").map((word,index)=>{
            return <p key={index} className="text-center font-bold text-gray-700 dark:text-gray-200 text-md">{word}</p>
          })    
        }
      </div>
        <p className="text-center font-semibold dark:text-gray-100 text-lg">{text}</p>
    </div>
  )
}
